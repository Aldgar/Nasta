import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsModule } from '../payments/payments.module';
import { NoShowService } from './no-show.service';
import { NoShowController } from './no-show.controller';

@Module({
  imports: [PrismaModule, NotificationsModule, PaymentsModule],
  controllers: [NoShowController],
  providers: [NoShowService],
  exports: [NoShowService],
})
export class NoShowModule {}
