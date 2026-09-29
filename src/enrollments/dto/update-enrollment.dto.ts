import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class UpdateEnrollmentDto {
  @ApiPropertyOptional({ example: '2026-09-28T21:15:00.000Z', description: 'Data de conclusão do curso' })
  @IsDateString()
  @IsOptional()
  dataConclusao?: Date;
}