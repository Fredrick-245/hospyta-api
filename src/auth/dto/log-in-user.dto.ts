import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
export class LogInUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  hash: string;
}
