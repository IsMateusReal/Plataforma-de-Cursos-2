import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class CreateEnrollmentDto {
  @ApiProperty({ example: 1, description: 'ID do Curso para realizar a matrícula' })
  @IsInt()
  @IsPositive()
  id_curso: number;
}