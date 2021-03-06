import { IsOptional } from 'class-validator';

export class UpdateSettingInput {
  @IsOptional()
  name?: string;

  @IsOptional()
  slug?: string;

  @IsOptional()
  type?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  value?: string;

  @IsOptional()
  options?: string;

  @IsOptional()
  private?: number;

  @IsOptional()
  sort?: number;
}
