import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { existsSync, readFileSync } from 'fs';
import helmet from 'helmet';
import { resolve } from 'path';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter';
import { SuperAdminBootstrapService } from './common/services/super-admin-bootstrap.service';

function readPortFromEnvFile(): number | null {
  try {
    const envPath = resolve(process.cwd(), '.env');
    if (!existsSync(envPath)) return null;

    const content = readFileSync(envPath, 'utf8');
    const match = content.match(/^\s*PORT\s*=\s*"?(\d+)"?\s*$/m);
    if (!match?.[1]) return null;

    const parsed = Number(match[1]);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(app.get(GlobalExceptionFilter));

  app.setGlobalPrefix('api/v1');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Academy Superadmin API')
    .setDescription('NestJS + Prisma + PostgreSQL Academy backend')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger', app, swaggerDoc, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  await app.init();

  try {
    await app.get(SuperAdminBootstrapService).ensureSuperAdmin();
  } catch (error) {
    logger.warn('Superadmin auto-create bajarilmadi. DB schema tekshiring.');
    logger.warn(error instanceof Error ? error.message : 'Nomalum xatolik');
  }

  const envFilePort = readPortFromEnvFile();
  const runtimePort = process.env.PORT ? Number(process.env.PORT) : undefined;
  const validRuntimePort =
    typeof runtimePort === 'number' && Number.isFinite(runtimePort)
      ? runtimePort
      : undefined;
  const port: number = envFilePort ?? validRuntimePort ?? 3000;

  await app.listen(port);
  logger.log(`Server port: ${port}`);
}

void bootstrap(); 

