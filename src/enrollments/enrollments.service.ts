import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEnrollmentDto: CreateEnrollmentDto, id_usuario: number) {
    const curso = await this.prisma.curso.findUnique({
      where: { id_curso: createEnrollmentDto.id_curso },
    });

    if (!curso) {
      throw new NotFoundException('Curso não encontrado.');
    }

    // Verificar se o utilizador já está matriculado neste curso
    const matriculaExistente = await this.prisma.matricula.findFirst({
      where: {
        id_usuario,
        id_curso: createEnrollmentDto.id_curso,
      },
    });

    if (matriculaExistente) {
      throw new ConflictException('O utilizador já se encontra matriculado neste curso.');
    }

    return this.prisma.matricula.create({
      data: {
        id_usuario,
        id_curso: createEnrollmentDto.id_curso,
      },
      include: {
        curso: {
          select: {
            id_curso: true,
            titulo: true,
            nivel: true,
            totalAulas: true,
            totalHoras: true,
          },
        },
      },
    });
  }

  async findMyEnrollments(id_usuario: number) {
    return this.prisma.matricula.findMany({
      where: { id_usuario },
      include: {
        curso: {
          include: {
            categoria: true,
            modulos: {
              include: { aulas: true },
            },
          },
        },
      },
      orderBy: { dataMatricula: 'desc' },
    });
  }

  async findOne(id: number, id_usuario: number) {
    const matricula = await this.prisma.matricula.findFirst({
      where: {
        id_matricula: id,
        id_usuario,
      },
      include: {
        curso: {
          include: {
            modulos: {
              include: { aulas: true },
            },
          },
        },
      },
    });

    if (!matricula) {
      throw new NotFoundException('Matrícula não encontrada.');
    }

    return matricula;
  }

  async update(id: number, id_usuario: number, updateEnrollmentDto: UpdateEnrollmentDto) {
    await this.findOne(id, id_usuario);

    return this.prisma.matricula.update({
      where: { id_matricula: id },
      data: updateEnrollmentDto,
    });
  }

  async remove(id: number, id_usuario: number) {
    await this.findOne(id, id_usuario);

    return this.prisma.matricula.delete({
      where: { id_matricula: id },
    });
  }
}