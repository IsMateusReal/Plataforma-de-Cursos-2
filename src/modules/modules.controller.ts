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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('modules')
@Controller('modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('token')
  @ApiOperation({ summary: 'Criar novo módulo num curso (requer autenticação)' })
  @ApiResponse({ status: 201, description: 'Módulo criado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
  create(@Body() createModuleDto: CreateModuleDto) {
    return this.modulesService.create(createModuleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os módulos (público)' })
  @ApiResponse({ status: 200, description: 'Lista de módulos devolvida com sucesso.' })
  findAll() {
    return this.modulesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter módulo e respetivas aulas por ID (público)' })
  @ApiResponse({ status: 200, description: 'Módulo encontrado.' })
  @ApiResponse({ status: 404, description: 'Módulo não encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.modulesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('token')
  @ApiOperation({ summary: 'Atualizar módulo (requer autenticação)' })
  @ApiResponse({ status: 200, description: 'Módulo atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Módulo não encontrado.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateModuleDto: UpdateModuleDto,
  ) {
    return this.modulesService.update(id, updateModuleDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('token')
  @ApiOperation({ summary: 'Remover módulo (requer autenticação)' })
  @ApiResponse({ status: 200, description: 'Módulo removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Módulo não encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.modulesService.remove(id);
  }
}