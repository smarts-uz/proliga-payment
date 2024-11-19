import { Module } from '@nestjs/common';
import { PaymeService } from './payme.service';
import { BalanceController } from "./controllers/balance.controller";
import { ExpenseController } from "./controllers/expense.controller";
import { PrismaModule } from 'src/prisma.module';

@Module({
  controllers: [BalanceController, ExpenseController],
  providers: [PaymeService],
  imports: [PrismaModule],
})
export class PaymeModule {}
