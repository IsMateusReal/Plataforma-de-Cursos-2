import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'mateus@email.com', description: 'E-mail do utilizador' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'senha123', description: 'Palavra-passe do utilizador' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}