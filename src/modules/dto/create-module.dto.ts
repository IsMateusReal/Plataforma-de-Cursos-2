import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateModuleDto {
  @ApiProperty({ example: 1, description: 'ID do Curso ao qual o módulo pertence' })
  @IsInt()
  @IsPositive()
  id_curso: number;

  @ApiProperty({ example: 'Introdução e Fundamentos de Arquitetura' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({ example: 1, description: 'Ordem de exibição do módulo no curso' })
  @IsInt()
  @IsPositive()
  ordem: number;
}