import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * Global validation pipe:
   * - whitelist: strip unknown properties from request bodies
   * - forbidNonWhitelisted: throw if unknown properties are sent
   * - transform: auto-cast primitives (e.g. string → number for @IsNumber)
   */
  app.enableCors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`\n🚀  Permission Management API is running on http://localhost:${port}`);
  console.log(`\n📋  Quick start:`);
  console.log(`    POST /auth/seed          — create superadmin (ANOMALY_ADMIN)`);
  console.log(`    POST /auth/login         — { "username": "superadmin" }`);
  console.log(`    POST /permission-requests — request roles (any JWT holder)`);
  console.log(`    PATCH /permission-requests/:id/approve — approve roles\n`);
}

bootstrap();
