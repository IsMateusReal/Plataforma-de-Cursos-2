import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString, IsUrl } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({ example: 1, description: 'ID do Módulo associado' })
  @IsInt()
  @IsPositive()
  id_modulo: number;

  @ApiProperty({ example: 'Arquitetura Modular e Injeção de Dependências' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({ example: 'video', description: 'Tipo do conteúdo (video, artigo, quiz)' })
  @IsString()
  @IsNotEmpty()
  tipoConteudo: string;

  @ApiProperty({ example: 'https://cdn.plataforma.com/videos/aula-01.mp4' })
  @IsString()
  @IsNotEmpty()
  url_conteudo: string;

  @ApiProperty({ example: 15, description: 'Duração estimada em minutos' })
  @IsInt()
  @IsPositive()
  duracaoMinutos: number;

  @ApiProperty({ example: 1, description: 'Ordem da aula dentro do módulo' })
  @IsInt()
  @IsPositive()
  ordem: number;
}