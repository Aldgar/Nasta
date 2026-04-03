import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailTranslationsService } from '../notifications/email-translations.service';
import { PaymentsService } from '../payments/payments.service';

// Fixed penalty amount in cents (e.g., €25.00)
const NO_SHOW_PENALTY_AMOUNT = 2500;
const NO_SHOW_PENALTY_CURRENCY = 'EUR';

@Injectable()
export class NoShowService {
  private readonly logger = new Logger(NoShowService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private emailTranslations: EmailTranslationsService,
    private payments: PaymentsService,
  ) {}

  /**
   * Report a service provider no-show for an accepted application.
   * Called by the employer when the scheduled start time has passed and
   * the verification code has NOT been used.
   */
  async reportNoShow(employerId: string, applicationId: string) {
    // 1. Validate & fetch application with related data
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            startDate: true,
            employerId: true,
            status: true,
          },
        },
        applicant: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            language: true,
            noShowCount: true,
            accountBalance: true,
          },
        },
      },
    });

    if (!app) {
      throw new NotFoundException('Application not found');
    }

    // Must be the employer for this job
    if (app.job.employerId !== employerId) {
      throw new ForbiddenException(
        'Only the employer for this job can report a no-show',
      );
    }

    // Application must be accepted (status ACCEPTED)
    if (app.status !== 'ACCEPTED') {
      throw new BadRequestException(
        'Can only report no-show for accepted applications',
      );
    }

    // Job scheduled start time must have passed
    if (!app.job.startDate) {
      throw new BadRequestException('Job has no scheduled start date');
    }

    const now = new Date();
    if (new Date(app.job.startDate) > now) {
      throw new BadRequestException(
        'Cannot report no-show before the scheduled start time',
      );
    }

    // Verification code must NOT have been verified (service not started)
    if (app.verificationCodeVerifiedAt) {
      throw new BadRequestException(
        'Cannot report no-show: the verification code has already been used — the service provider has checked in',
      );
    }

    // Prevent duplicate no-show reports for the same application
    const existing = await this.prisma.noShowRecord.findFirst({
      where: { applicationId },
    });
    if (existing) {
      throw new BadRequestException(
        'A no-show has already been reported for this application',
      );
    }

    // 2. Determine offense number & severity
    const newNoShowCount = app.applicant.noShowCount + 1;
    const isFirstOffense = newNoShowCount === 1;
    const severity = isFirstOffense ? 'WARNING' : 'PENALTY';
    const penaltyAmount = isFirstOffense ? null : NO_SHOW_PENALTY_AMOUNT;
    const penaltyCurrency = isFirstOffense ? null : NO_SHOW_PENALTY_CURRENCY;

    // 3. Create no-show record
    const record = await this.prisma.noShowRecord.create({
      data: {
        serviceProviderId: app.applicant.id,
        applicationId,
        jobId: app.job.id,
        reportedBy: employerId,
        offenseNumber: newNoShowCount,
        severity,
        penaltyAmount,
        penaltyCurrency,
      },
    });

    // 4. Update the provider's noShowCount and (if penalty) deduct from balance
    const userUpdate: any = {
      noShowCount: newNoShowCount,
    };
    if (!isFirstOffense && penaltyAmount) {
      // Balance can go negative
      userUpdate.accountBalance = {
        decrement: penaltyAmount,
      };
    }

    await this.prisma.user.update({
      where: { id: app.applicant.id },
      data: userUpdate,
    });

    // 5. Cancel the job (set status to CANCELLED_NO_SHOW)
    await this.prisma.job.update({
      where: { id: app.job.id },
      data: { status: 'CANCELLED_NO_SHOW' },
    });

    // Cancel any active booking
    await this.prisma.booking.updateMany({
      where: {
        jobId: app.job.id,
        jobSeekerId: app.applicant.id,
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
      },
      data: { status: 'CANCELLED' },
    });

    // 6. Refund the employer's payment
    try {
      const payment = await this.prisma.payment.findFirst({
        where: {
          applications: { some: { id: applicationId } },
          status: 'SUCCEEDED',
        },
      });
      if (payment) {
        await this.payments.refundApplicationPayment(
          payment.id,
          payment.amount || 0,
          0,
          `Full refund: service provider no-show for job "${app.job.title}"`,
        );
      }
    } catch (err) {
      this.logger.error('[NoShow] Failed to refund employer payment:', err);
      // Continue — don't block the no-show report if refund fails
    }

    // 7. Notify the service provider
    const providerFirstName = app.applicant.firstName || 'there';
    const jobTitle = app.job.title || 'Unknown Job';

    if (isFirstOffense) {
      // --- 1st offense: WARNING ---
      await this.sendWarningNotification(
        app.applicant.id,
        app.applicant.email,
        providerFirstName,
        jobTitle,
        applicationId,
        app.job.id,
      );
    } else {
      // --- 2nd offense+: PENALTY ---
      const formattedPenalty = `${NO_SHOW_PENALTY_CURRENCY} ${(NO_SHOW_PENALTY_AMOUNT / 100).toFixed(2)}`;
      await this.sendPenaltyNotification(
        app.applicant.id,
        app.applicant.email,
        providerFirstName,
        jobTitle,
        newNoShowCount,
        formattedPenalty,
        applicationId,
        app.job.id,
      );
    }

    return {
      noShowRecord: record,
      offense: newNoShowCount,
      severity,
      penaltyAmount,
      penaltyCurrency,
      message: isFirstOffense
        ? 'No-show reported. A formal warning has been issued to the service provider.'
        : `No-show reported. A penalty of ${NO_SHOW_PENALTY_CURRENCY} ${(NO_SHOW_PENALTY_AMOUNT / 100).toFixed(2)} has been applied to the service provider's account.`,
    };
  }

  // ─── Notification helpers ───────────────────────────────────

  /** Send warning (1st offense) via in-app + push + email */
  private async sendWarningNotification(
    userId: string,
    email: string | null,
    firstName: string,
    jobTitle: string,
    applicationId: string,
    jobId: string,
  ) {
    const t = await this.emailTranslations.getTranslatorForUser(userId);
    const title = t('notifications.templates.noShowWarningTitle');
    const body = t('notifications.templates.noShowWarningBody', { jobTitle });

    // In-app + push
    await this.notifications.createNotification({
      userId,
      type: 'WARNING',
      title,
      body,
      payload: { applicationId, jobId, noShowOffense: 1 },
    });

    // Email
    if (email) {
      try {
        const language =
          (await this.getUserLanguage(userId)) === 'pt' ? 'pt' : 'en';
        const html = this.notifications.getBrandedEmailTemplate(
          title,
          `Hi ${firstName},`,
          `
            <p style="margin: 0 0 16px; color: #F5E6C8;">
              You were reported for not showing up to the job <strong>"${jobTitle}"</strong>.
            </p>
            <div style="padding: 16px; background-color: #1A2A44; border-radius: 8px; border-left: 4px solid #C9963F; margin-bottom: 16px;">
              <p style="margin: 0; color: #F5E6C8; font-weight: 600;">⚠️ This is a formal warning.</p>
            </div>
            <p style="margin: 0 0 16px; color: #B8A88A;">
              Not showing up for a committed job harms employers and the platform community. If this happens again, <strong>a financial penalty</strong> will be automatically applied to your account.
            </p>
            <p style="margin: 0; color: #B8A88A;">
              Please ensure you communicate any schedule changes in advance to avoid future issues.
            </p>
          `,
          'If you believe this was reported in error, please contact our support team.',
          t,
          language,
        );
        await this.notifications.sendEmail(
          email,
          'No-Show Warning — Action Required',
          `You were reported for not showing up to "${jobTitle}". This is a formal warning.`,
          html,
        );
      } catch (err) {
        this.logger.error('[NoShow] Failed to send warning email:', err);
      }
    }
  }

  /** Send penalty (2nd offense+) via in-app + push + email */
  private async sendPenaltyNotification(
    userId: string,
    email: string | null,
    firstName: string,
    jobTitle: string,
    offenseNumber: number,
    formattedPenalty: string,
    applicationId: string,
    jobId: string,
  ) {
    const t = await this.emailTranslations.getTranslatorForUser(userId);
    const title = t('notifications.templates.noShowPenaltyTitle');
    const body = t('notifications.templates.noShowPenaltyBody', {
      jobTitle,
      offenseNumber,
      formattedPenalty,
    });

    // In-app + push
    await this.notifications.createNotification({
      userId,
      type: 'WARNING',
      title,
      body,
      payload: {
        applicationId,
        jobId,
        noShowOffense: offenseNumber,
        penaltyAmount: NO_SHOW_PENALTY_AMOUNT,
        penaltyCurrency: NO_SHOW_PENALTY_CURRENCY,
      },
    });

    // Email
    if (email) {
      try {
        const language =
          (await this.getUserLanguage(userId)) === 'pt' ? 'pt' : 'en';
        const html = this.notifications.getBrandedEmailTemplate(
          title,
          `Hi ${firstName},`,
          `
            <p style="margin: 0 0 16px; color: #F5E6C8;">
              You were reported for not showing up to the job <strong>"${jobTitle}"</strong>.
              This is your <strong>${this.ordinal(offenseNumber)} offense</strong>.
            </p>
            <div style="padding: 16px; background-color: #2A1A1A; border-radius: 8px; border-left: 4px solid #ef4444; margin-bottom: 16px;">
              <p style="margin: 0; color: #F87171; font-weight: 600;">
                💰 A penalty of <strong>${formattedPenalty}</strong> has been applied to your account.
              </p>
            </div>
            <p style="margin: 0 0 16px; color: #B8A88A;">
              This amount will be automatically deducted from your next job payout. If your balance is insufficient, your account balance will go negative and the remaining amount will be deducted from future earnings.
            </p>
            <p style="margin: 0; color: #B8A88A;">
              Continued no-shows may lead to further penalties and account restrictions.
            </p>
          `,
          'If you believe this was reported in error, please contact our support team.',
          t,
          language,
        );
        await this.notifications.sendEmail(
          email,
          `No-Show Penalty Applied — ${formattedPenalty}`,
          `You were reported for no-show on "${jobTitle}" (offense #${offenseNumber}). A penalty of ${formattedPenalty} has been applied.`,
          html,
        );
      } catch (err) {
        this.logger.error('[NoShow] Failed to send penalty email:', err);
      }
    }
  }

  /**
   * Send obligation reminder to service provider right after employer accepts the application.
   * Called from ApplicationsService when status changes to ACCEPTED.
   */
  async sendAcceptanceObligationReminder(
    serviceProviderId: string,
    email: string | null,
    firstName: string,
    jobTitle: string,
    startDate: Date | null,
    applicationId: string,
    jobId: string,
  ) {
    const formattedDate = startDate
      ? startDate.toLocaleDateString('en-GB', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'the scheduled time';

    const t =
      await this.emailTranslations.getTranslatorForUser(serviceProviderId);
    const title = t('notifications.templates.jobCommitmentReminderTitle');
    const body = t('notifications.templates.jobCommitmentReminderBody', {
      jobTitle,
      formattedDate,
    });

    // In-app + push
    await this.notifications.createNotification({
      userId: serviceProviderId,
      type: 'APPLICATION_UPDATE',
      title,
      body,
      payload: { applicationId, jobId, type: 'obligation_reminder' },
    });

    // Email
    if (email) {
      try {
        const language =
          (await this.getUserLanguage(serviceProviderId)) === 'pt'
            ? 'pt'
            : 'en';
        const html = this.notifications.getBrandedEmailTemplate(
          title,
          `Hi ${firstName},`,
          `
            <p style="margin: 0 0 16px; color: #F5E6C8;">
              Congratulations! You have been accepted for <strong>"${jobTitle}"</strong>.
            </p>
            <div style="padding: 16px; background-color: #1A2A44; border-radius: 8px; border-left: 4px solid #22c55e; margin-bottom: 16px;">
              <p style="margin: 0 0 8px; color: #F5E6C8; font-weight: 600;">📅 Scheduled Time</p>
              <p style="margin: 0; color: #4ADE80; font-size: 18px;">${formattedDate}</p>
            </div>
            <div style="padding: 16px; background-color: #2A2A1A; border-radius: 8px; border-left: 4px solid #C9963F; margin-bottom: 16px;">
              <p style="margin: 0 0 8px; color: #F5E6C8; font-weight: 600;">⚠️ Important: Attendance Policy</p>
              <p style="margin: 0; color: #B8A88A;">
                By accepting this job, you are committing to show up at the scheduled time. Our no-show policy is as follows:
              </p>
              <ul style="margin: 12px 0 0; padding-left: 20px; color: #B8A88A;">
                <li style="margin-bottom: 8px;"><strong>1st no-show:</strong> Formal warning on your account</li>
                <li style="margin-bottom: 8px;"><strong>2nd no-show onwards:</strong> Financial penalty of €25.00 per incident, deducted from your earnings</li>
              </ul>
            </div>
            <p style="margin: 0; color: #B8A88A;">
              If you cannot make it, please withdraw your application or communicate with the employer as early as possible.
            </p>
          `,
          'This is an automated reminder sent upon job acceptance.',
          t,
          language,
        );
        await this.notifications.sendEmail(
          email,
          `Job Commitment Reminder: ${jobTitle}`,
          `You have been accepted for "${jobTitle}" on ${formattedDate}. Please make sure to arrive on time. No-shows result in warnings and penalties.`,
          html,
        );
      } catch (err) {
        this.logger.error(
          '[NoShow] Failed to send obligation reminder email:',
          err,
        );
      }
    }
  }

  // ─── Helpers ────────────────────────────────────────────────

  private async getUserLanguage(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { language: true },
    });
    return user?.language ?? null;
  }

  private ordinal(n: number): string {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }
}
