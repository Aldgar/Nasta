import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminJwtGuard } from '../auth/guards/admin-jwt.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('admin')
@Public()
@UseGuards(AdminJwtGuard)
export class AdminDashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('dashboard-stats')
  async getDashboardStats() {
    const [
      totalUsers,
      kycPending,
      kycInReview,
      openTickets,
      unassignedTickets,
      abuseReports,
      securityReports,
      pendingDeletions,
    ] = await Promise.all([
      // Total users
      this.prisma.user.count(),

      // KYC: pending verifications
      this.prisma.idVerification.count({
        where: { status: 'PENDING' },
      }),

      // KYC: in-review verifications (IN_PROGRESS + MANUAL_REVIEW)
      this.prisma.idVerification.count({
        where: { status: { in: ['IN_PROGRESS', 'MANUAL_REVIEW'] } },
      }),

      // Support tickets: open (OPEN + IN_PROGRESS), excluding surveys/abuse/security
      this.prisma.supportTicket.count({
        where: {
          status: { in: ['OPEN', 'IN_PROGRESS'] },
          category: {
            notIn: ['EMPLOYER_SURVEY', 'PROVIDER_SURVEY', 'ABUSE', 'SECURITY'],
          },
        },
      }),

      // Support tickets: unassigned
      this.prisma.supportTicket.count({
        where: {
          assignedTo: null,
          status: 'OPEN',
          category: {
            notIn: ['EMPLOYER_SURVEY', 'PROVIDER_SURVEY', 'ABUSE', 'SECURITY'],
          },
        },
      }),

      // Abuse reports (open)
      this.prisma.supportTicket.count({
        where: {
          category: 'ABUSE',
          status: { in: ['OPEN', 'IN_PROGRESS'] },
        },
      }),

      // Security reports (open)
      this.prisma.supportTicket.count({
        where: {
          category: 'SECURITY',
          status: { in: ['OPEN', 'IN_PROGRESS'] },
        },
      }),

      // Pending deletion requests
      this.prisma.deletionRequest.count({
        where: { status: 'PENDING' },
      }),
    ]);

    return {
      totalUsers,
      kycPending,
      kycInReview,
      openTickets,
      unassignedTickets,
      abuseReports,
      securityReports,
      pendingDeletions,
    };
  }
}
