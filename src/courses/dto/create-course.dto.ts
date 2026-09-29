import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({ example: 'Curso Completo de NestJS e Prisma' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiPropertyOptional({ example: 'Aprenda a construir APIs profissionais e seguras.' })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiProperty({ example: 1, description: 'ID da Categoria associada' })
  @IsInt()
  @IsPositive()
  id_categoria: number;

  @ApiProperty({ example: 'Iniciante', description: 'Nível de dificuldade do curso' })
  @IsString()
  @IsNotEmpty()
  nivel: string;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsInt()
  @IsOptional()
  totalAulas?: number;

  @ApiPropertyOptional({ example: 0.0, default: 0.0 })
  @IsNumber()
  @IsOptional()
  totalHoras?: number;
}