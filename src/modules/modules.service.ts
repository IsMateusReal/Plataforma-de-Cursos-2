import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

@Injectable()
export class ModulesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createModuleDto: CreateModuleDto) {
    const cursoExiste = await this.prisma.curso.findUnique({
      where: { id_curso: createModuleDto.id_curso },
    });

    if (!cursoExiste) {
      throw new NotFoundException('Curso associado não foi encontrado.');
    }

    return this.prisma.modulo.create({
      data: createModuleDto,
      include: {
        curso: {
          select: { id_curso: true, titulo: true },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.modulo.findMany({
      include: {
        curso: {
          select: { id_curso: true, titulo: true },
        },
        aulas: true,
      },
      orderBy: { ordem: 'asc' },
    });
  }

  async findOne(id: number) {
    const modulo = await this.prisma.modulo.findUnique({
      where: { id_modulo: id },
      include: {
        curso: true,
        aulas: {
          orderBy: { ordem: 'asc' },
        },
      },
    });

    if (!modulo) {
      throw new NotFoundException('Módulo não encontrado.');
    }

    return modulo;
  }

  async update(id: number, updateModuleDto: UpdateModuleDto) {
    await this.findOne(id);

    return this.prisma.modulo.update({
      where: { id_modulo: id },
      data: updateModuleDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.modulo.delete({
      where: { id_modulo: id },
    });
  }
}