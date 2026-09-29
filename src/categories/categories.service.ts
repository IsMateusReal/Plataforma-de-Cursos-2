import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const existing = await this.prisma.categoria.findUnique({
      where: { nome: createCategoryDto.nome },
    });

    if (existing) {
      throw new ConflictException('Já existe uma categoria cadastrada com esse nome.');
    }

    return this.prisma.categoria.create({
      data: createCategoryDto,
    });
  }

  async findAll() {
    return this.prisma.categoria.findMany({
      include: {
        _count: {
          select: { cursos: true },
        },
      },
      orderBy: { id_categoria: 'asc' },
    });
  }

  async findOne(id: number) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id_categoria: id },
      include: {
        cursos: {
          select: {
            id_curso: true,
            titulo: true,
            nivel: true,
          },
        },
      },
    });

    if (!categoria) {
      throw new NotFoundException('Categoria não encontrada.');
    }

    return categoria;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);

    if (updateCategoryDto.nome) {
      const existing = await this.prisma.categoria.findUnique({
        where: { nome: updateCategoryDto.nome },
      });

      if (existing && existing.id_categoria !== id) {
        throw new ConflictException('Já existe outra categoria com esse nome.');
      }
    }

    return this.prisma.categoria.update({
      where: { id_categoria: id },
      data: updateCategoryDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.categoria.delete({
      where: { id_categoria: id },
    });
  }
}