import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { NoShowService } from './no-show.service';
import { ReportNoShowDto } from './dto/report-no-show.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('no-show')
@UseGuards(RolesGuard)
export class NoShowController {
  constructor(private readonly noShowService: NoShowService) {}

  /**
   * POST /no-show/report
   * Employer reports a service provider no-show for an accepted application.
   */
  @Post('report')
  @Roles('EMPLOYER')
  async reportNoShow(@Request() req: any, @Body() dto: ReportNoShowDto) {
    return this.noShowService.reportNoShow(req.user.sub, dto.applicationId);
  }
}
