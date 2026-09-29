import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonProgressDto } from './dto/create-lesson-progress.dto';

@Injectable()
export class LessonProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async setProgress(dto: CreateLessonProgressDto, id_usuario: number) {
    const aula = await this.prisma.aula.findUnique({
      where: { id_aula: dto.id_aula },
    });

    if (!aula) {
      throw new NotFoundException('Aula não encontrada.');
    }

    const dataConclusao = dto.status === 'CONCLUIDA' ? new Date() : null;

    return this.prisma.progressoAula.upsert({
      where: {
        id_usuario_id_aula: {
          id_usuario,
          id_aula: dto.id_aula,
        },
      },
      update: {
        status: dto.status,
        dataConclusao,
      },
      create: {
        id_usuario,
        id_aula: dto.id_aula,
        status: dto.status,
        dataConclusao,
      },
      include: {
        aula: {
          select: {
            id_aula: true,
            titulo: true,
            duracaoMinutos: true,
            modulo: {
              select: { id_modulo: true, titulo: true, id_curso: true },
            },
          },
        },
      },
    });
  }

  async findCourseProgress(id_curso: number, id_usuario: number) {
    // Busca todas as aulas do curso através dos módulos
    const aulasDoCurso = await this.prisma.aula.findMany({
      where: {
        modulo: {
          id_curso,
        },
      },
      select: {
        id_aula: true,
      },
    });

    const totalAulas = aulasDoCurso.length;
    const idsAulas = aulasDoCurso.map((a) => a.id_aula);

    const aulasConcluidas = await this.prisma.progressoAula.count({
      where: {
        id_usuario,
        id_aula: { in: idsAulas },
        status: 'CONCLUIDA',
      },
    });

    const percentual =
      totalAulas > 0 ? Number(((aulasConcluidas / totalAulas) * 100).toFixed(1)) : 0;

    return {
      id_curso,
      totalAulas,
      aulasConcluidas,
      percentualConcluido: percentual,
    };
  }

  async findLessonProgress(id_aula: number, id_usuario: number) {
    const progresso = await this.prisma.progressoAula.findUnique({
      where: {
        id_usuario_id_aula: {
          id_usuario,
          id_aula,
        },
      },
    });

    return progresso ?? { id_usuario, id_aula, status: 'NAO_INICIADA', dataConclusao: null };
  }
}