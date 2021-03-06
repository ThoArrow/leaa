import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateActionInput {
  @IsNotEmpty()
  ip?: string;

  @IsNotEmpty()
  module!: string;

  @IsOptional()
  action?: string;

  @IsOptional()
  account?: string;

  @IsOptional()
  token?: string;

  @IsOptional()
  user_id?: string;

  @IsOptional()
  diff?: string;
}
