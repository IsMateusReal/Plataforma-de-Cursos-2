import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para permitir a comunicação com o front-end
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Ativa a validação automática e transformação dos DTOs via class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuração do Swagger com suporte a Bearer Token JWT e tags dos módulos
  const config = new DocumentBuilder()
    .setTitle('Plataforma de Cursos API')
    .setDescription(
      'Documentação dos endpoints da plataforma de cursos com autenticação JWT e controle de progresso',
    )
    .setVersion('1.0')
    .addTag('auth', 'Autenticação e geração de tokens')
    .addTag('users', 'Gerenciamento de usuários')
    .addTag('categories', 'Categorias temáticas dos cursos')
    .addTag('courses', 'Catálogo e gestão de cursos')
    .addTag('modules', 'Módulos organizadores de aulas')
    .addTag('lessons', 'Aulas e materiais de estudo')
    .addTag('enrollments', 'Matrículas dos alunos')
    .addTag('lesson-progress', 'Acompanhamento e conclusão de aulas')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
        description: 'Cole seu token JWT (sem a palavra Bearer)',
      },
      'token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log('Aplicação a correr em: http://localhost:3000/api');
}
bootstrap();