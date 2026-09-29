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
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('token')
  @ApiOperation({ summary: 'Criar novo curso (instrutor autenticado)' })
  @ApiResponse({ status: 201, description: 'Curso criado com sucesso.' })
  create(@Body() createCourseDto: CreateCourseDto, @Req() req: any) {
    console.log('Payload do usuário no req.user:', req.user);

    const idInstrutor =
      req.user?.id_usuario ??
      req.user?.sub ??
      req.user?.id ??
      req.user?.userId;

    return this.coursesService.create(createCourseDto, Number(idInstrutor));
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os cursos (público)' })
  @ApiResponse({ status: 200, description: 'Lista de cursos retornada com sucesso.' })
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar curso por ID (público)' })
  @ApiResponse({ status: 200, description: 'Curso encontrado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('token')
  @ApiOperation({ summary: 'Atualizar curso (requer autenticação)' })
  @ApiResponse({ status: 200, description: 'Curso atualizado com sucesso.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('token')
  @ApiOperation({ summary: 'Remover curso (requer autenticação)' })
  @ApiResponse({ status: 200, description: 'Curso removido com sucesso.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.remove(id);
  }
}