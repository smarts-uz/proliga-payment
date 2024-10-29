import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigModule } from '@nestjs/config';

async function bootstrap() {
  ConfigModule.forRoot({
    isGlobal: true, // Makes the config globally available
  });
  
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();
