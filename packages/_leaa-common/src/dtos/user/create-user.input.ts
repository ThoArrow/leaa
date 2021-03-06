import { IsOptional, IsNotEmpty, Length, MinLength, IsEmail, IsPhoneNumber } from 'class-validator';

export class CreateUserInput {
  @IsOptional()
  @IsPhoneNumber('CN')
  phone?: string;

  @IsNotEmpty()
  @IsEmail()
  @MinLength(4)
  email!: string;

  @IsOptional()
  @Length(1, 64)
  name?: string;

  @IsNotEmpty()
  @Length(6, 64)
  password!: string;

  status?: number;

  is_admin?: number;

  avatar_url?: string;
}
