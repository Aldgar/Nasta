import { IsNotEmpty, IsString } from 'class-validator';

export class ReportNoShowDto {
  @IsString()
  @IsNotEmpty()
  applicationId!: string;
}
