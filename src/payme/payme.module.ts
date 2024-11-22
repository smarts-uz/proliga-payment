import { Module } from '@nestjs/common';
import { PaymeService } from './payme.service';
import { PaymeController } from './payme.controller';
import { PrismaModule } from 'src/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [PaymeController],
  providers: [PaymeService],
  imports: [PrismaModule, AuthModule],
})
export class PaymeModule {}
