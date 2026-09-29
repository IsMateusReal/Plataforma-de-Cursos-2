import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar utilizador e gerar token JWT' })
  @ApiResponse({ status: 200, description: 'Login efetuado com sucesso.' })
  @ApiResponse({ status: 401, description: 'E-mail ou palavra-passe incorretos.' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}