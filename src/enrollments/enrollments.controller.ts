import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('enrollments')
@Controller('enrollments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('token')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Matricular utilizador autenticado num curso' })
  @ApiResponse({ status: 201, description: 'Matrícula efetuada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
  @ApiResponse({ status: 409, description: 'Utilizador já matriculado neste curso.' })
  create(@Body() createEnrollmentDto: CreateEnrollmentDto, @Req() req: any) {
    const idUsuario = req.user?.id_usuario ?? req.user?.sub ?? req.user?.id ?? req.user?.userId;
    return this.enrollmentsService.create(createEnrollmentDto, Number(idUsuario));
  }

  @Get('my-courses')
  @ApiOperation({ summary: 'Listar cursos em que o utilizador autenticado está matriculado' })
  @ApiResponse({ status: 200, description: 'Lista de matrículas devolvida com sucesso.' })
  findMyEnrollments(@Req() req: any) {
    const idUsuario = req.user?.id_usuario ?? req.user?.sub ?? req.user?.id ?? req.user?.userId;
    return this.enrollmentsService.findMyEnrollments(Number(idUsuario));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma matrícula por ID' })
  @ApiResponse({ status: 200, description: 'Matrícula encontrada.' })
  @ApiResponse({ status: 404, description: 'Matrícula não encontrada.' })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const idUsuario = req.user?.id_usuario ?? req.user?.sub ?? req.user?.id ?? req.user?.userId;
    return this.enrollmentsService.findOne(id, Number(idUsuario));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados da matrícula (ex: data de conclusão)' })
  @ApiResponse({ status: 200, description: 'Matrícula atualizada.' })
  @ApiResponse({ status: 404, description: 'Matrícula não encontrada.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
    @Req() req: any,
  ) {
    const idUsuario = req.user?.id_usuario ?? req.user?.sub ?? req.user?.id ?? req.user?.userId;
    return this.enrollmentsService.update(id, Number(idUsuario), updateEnrollmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancelar matrícula num curso' })
  @ApiResponse({ status: 200, description: 'Matrícula cancelada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Matrícula não encontrada.' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const idUsuario = req.user?.id_usuario ?? req.user?.sub ?? req.user?.id ?? req.user?.userId;
    return this.enrollmentsService.remove(id, Number(idUsuario));
  }
}