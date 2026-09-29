import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateLessonProgressDto {
  @ApiProperty({ example: 1, description: 'ID da Aula' })
  @IsInt()
  @IsPositive()
  id_aula: number;

  @ApiProperty({
    example: 'CONCLUIDA',
    description: 'Status do progresso da aula',
    enum: ['EM_ANDAMENTO', 'CONCLUIDA'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['EM_ANDAMENTO', 'CONCLUIDA'])
  status: string;
}