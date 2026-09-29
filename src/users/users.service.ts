import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(createUserDto.password, salt);

    return this.prisma.usuario.create({
      data: {
        nomeCompleto: createUserDto.nomeCompleto,
        email: createUserDto.email,
        senhaHash: hash,
      },
      select: {
        id_usuario: true,
        nomeCompleto: true,
        email: true,
        dataCadastro: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: { email },
    });
  }

  async findAll() {
    return this.prisma.usuario.findMany({
      select: {
        id_usuario: true,
        nomeCompleto: true,
        email: true,
        dataCadastro: true,
      },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
      select: {
        id_usuario: true,
        nomeCompleto: true,
        email: true,
        dataCadastro: true,
      },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const data: any = { ...updateUserDto };
    delete data.password;

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      data.senhaHash = await bcrypt.hash(updateUserDto.password, salt);
    }

    return this.prisma.usuario.update({
      where: { id_usuario: id },
      data,
      select: {
        id_usuario: true,
        nomeCompleto: true,
        email: true,
        dataCadastro: true,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.usuario.delete({
      where: { id_usuario: id },
      select: {
        id_usuario: true,
        nomeCompleto: true,
        email: true,
      },
    });
  }
}