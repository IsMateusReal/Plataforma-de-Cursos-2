import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LessonProgressService } from './lesson-progress.service';
import { CreateLessonProgressDto } from './dto/create-lesson-progress.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('lesson-progress')
@Controller('lesson-progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('token')
export class LessonProgressController {
  constructor(private readonly lessonProgressService: LessonProgressService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar ou atualizar progresso de uma aula' })
  @ApiResponse({ status: 200, description: 'Progresso atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Aula não encontrada.' })
  setProgress(@Body() dto: CreateLessonProgressDto, @Req() req: any) {
    const idUsuario = req.user?.id_usuario ?? req.user?.sub ?? req.user?.id ?? req.user?.userId;
    return this.lessonProgressService.setProgress(dto, Number(idUsuario));
  }

  @Get('course/:id_curso')
  @ApiOperation({ summary: 'Obter percentual e contadores de progresso do utilizador no curso' })
  @ApiResponse({ status: 200, description: 'Progresso do curso retornado com sucesso.' })
  findCourseProgress(
    @Param('id_curso', ParseIntPipe) id_curso: number,
    @Req() req: any,
  ) {
    const idUsuario = req.user?.id_usuario ?? req.user?.sub ?? req.user?.id ?? req.user?.userId;
    return this.lessonProgressService.findCourseProgress(id_curso, Number(idUsuario));
  }

  @Get('lesson/:id_aula')
  @ApiOperation({ summary: 'Obter status de conclusão de uma aula específica' })
  @ApiResponse({ status: 200, description: 'Status retornado com sucesso.' })
  findLessonProgress(
    @Param('id_aula', ParseIntPipe) id_aula: number,
    @Req() req: any,
  ) {
    const idUsuario = req.user?.id_usuario ?? req.user?.sub ?? req.user?.id ?? req.user?.userId;
    return this.lessonProgressService.findLessonProgress(id_aula, Number(idUsuario));
  }
}