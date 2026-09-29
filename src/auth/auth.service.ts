import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

export interface JwtPayload {
  sub: number;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    // Procura o utilizador pelo e-mail
    const user = await this.usersService.findByEmail(loginDto.email);

    // Valida a palavra-passe encriptada guardada na base de dados
    if (!user || !(await bcrypt.compare(loginDto.password, user.senhaHash))) {
      throw new UnauthorizedException('E-mail ou palavra-passe incorretos');
    }

    // Cria o payload do token JWT
    const payload: JwtPayload = { sub: user.id_usuario, email: user.email };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}