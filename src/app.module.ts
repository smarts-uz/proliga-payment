import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClickModule } from './click/click.module';
import { UzumModule } from './uzum/uzum.model';
import { PaymeModule } from './payme/payme.module';

@Module({
  imports: [ClickModule, PaymeModule, UzumModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


