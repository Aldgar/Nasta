import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsOptional()
  @IsString()
  priceId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  amount?: number; // in smallest currency unit

  @IsOptional()
  @IsString()
  currency?: string; // e.g., 'usd'

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsIn(['payment', 'subscription', 'setup'])
  mode?: 'payment' | 'subscription' | 'setup';

  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  successUrl!: string;

  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  cancelUrl!: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;

  @IsOptional()
  @IsString()
  jobId?: string;
}
