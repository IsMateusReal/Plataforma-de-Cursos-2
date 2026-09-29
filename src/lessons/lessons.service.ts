import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLessonDto: CreateLessonDto) {
    const modulo = await this.prisma.modulo.findUnique({
      where: { id_modulo: createLessonDto.id_modulo },
    });

    if (!modulo) {
      throw new NotFoundException('Módulo associado não foi encontrado.');
    }

    const aula = await this.prisma.aula.create({
      data: createLessonDto,
      include: {
        modulo: {
          select: { id_modulo: true, titulo: true, id_curso: true },
        },
      },
    });

    // Atualiza contadores no Curso correspondente
    await this.prisma.curso.update({
      where: { id_curso: modulo.id_curso },
      data: {
        totalAulas: { increment: 1 },
        totalHoras: { increment: Number((createLessonDto.duracaoMinutos / 60).toFixed(2)) },
      },
    });

    return aula;
  }

  async findAll() {
    return this.prisma.aula.findMany({
      include: {
        modulo: {
          select: { id_modulo: true, titulo: true, id_curso: true },
        },
      },
      orderBy: { ordem: 'asc' },
    });
  }

  async findOne(id: number) {
    const aula = await this.prisma.aula.findUnique({
      where: { id_aula: id },
      include: {
        modulo: true,
      },
    });

    if (!aula) {
      throw new NotFoundException('Aula não encontrada.');
    }

    return aula;
  }

  async update(id: number, updateLessonDto: UpdateLessonDto) {
    await this.findOne(id);

    return this.prisma.aula.update({
      where: { id_aula: id },
      data: updateLessonDto,
    });
  }

  async remove(id: number) {
    const aula = await this.findOne(id);

    const modulo = await this.prisma.modulo.findUnique({
      where: { id_modulo: aula.id_modulo },
    });

    if (modulo) {
      await this.prisma.curso.update({
        where: { id_curso: modulo.id_curso },
        data: {
          totalAulas: { decrement: 1 },
          totalHoras: { decrement: Number((aula.duracaoMinutos / 60).toFixed(2)) },
        },
      });
    }

    return this.prisma.aula.delete({
      where: { id_aula: id },
    });
  }
}