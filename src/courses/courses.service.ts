import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCourseDto: CreateCourseDto, id_instrutor: number) {
    return this.prisma.curso.create({
      data: {
        titulo: createCourseDto.titulo,
        descricao: createCourseDto.descricao,
        nivel: createCourseDto.nivel,
        id_categoria: createCourseDto.id_categoria,
        id_instrutor,
        totalAulas: createCourseDto.totalAulas ?? 0,
        totalHoras: createCourseDto.totalHoras ?? 0,
      },
      include: {
        instrutor: {
          select: { id_usuario: true, nomeCompleto: true, email: true },
        },
        categoria: true,
      },
    });
  }

  async findAll() {
    return this.prisma.curso.findMany({
      include: {
        instrutor: {
          select: { id_usuario: true, nomeCompleto: true, email: true },
        },
        categoria: true,
        modulos: {
          orderBy: { ordem: 'asc' },
          include: {
            aulas: {
              orderBy: { ordem: 'asc' },
            },
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const curso = await this.prisma.curso.findUnique({
      where: { id_curso: id },
      include: {
        instrutor: {
          select: { id_usuario: true, nomeCompleto: true, email: true },
        },
        categoria: true,
        modulos: {
          include: { aulas: true },
        },
      },
    });

    if (!curso) throw new NotFoundException('Curso não encontrado');
    return curso;
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    await this.findOne(id);

    return this.prisma.curso.update({
      where: { id_curso: id },
      data: updateCourseDto,
      include: {
        instrutor: {
          select: { id_usuario: true, nomeCompleto: true, email: true },
        },
        categoria: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.curso.delete({
      where: { id_curso: id },
    });
  }
}