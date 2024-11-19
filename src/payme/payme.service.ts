import { Injectable } from '@nestjs/common';
import { TransactionMethods } from './constants/transaction-methods';
import { BalanceCheckPerformTransactionDto } from './dto/balance/check-perform-transaction.dto';
import { PrismaService } from 'src/prisma.service';
import { RequestBody } from './types/incoming-request-body';
import { BalanceGetStatementDto } from './dto/balance/get-statement.dto';
import { BalanceCancelTransactionDto } from '../payme/dto/balance/cancel-transaction.dto';
import { BalancePerformTransactionDto } from './dto/balance/perform-transaction.dto';
import { BalanceCheckTransactionDto } from './dto/balance/check-transaction.dto';
import { BalanceCreateTransactionDto } from './dto/balance/create-transaction.dto';
import { DateTime } from 'luxon';

import { BalanceCheckPerformTransaction } from './methods/balance/checkPerformTransaction';
import { BalanceCreateTransaction } from './methods/balance/createTransaction';
import { BalanceCheckTransaction } from './methods/balance/checkTransaction';
import { BalancePerformTransaction } from './methods/balance/performTransaction';
import { BalanceCancelTransaction } from './methods/balance/cancelTransaction';
import { BalanceGetStatement } from './methods/balance/getStatement';

export const CancelingReasons = {
  CanceledDueToTimeout: 'Canceled due to timeout',
};

@Injectable()
export class PaymeService {
  constructor(private readonly prismaService: PrismaService) {}

  async handleTransactionMethods(reqBody: RequestBody) {
    const method = reqBody.method;

    switch (method) {
      case TransactionMethods.BalanceCheckPerformTransaction:
        return await this.BalanceCheckPerformTransaction(
          reqBody as unknown as BalanceCheckPerformTransactionDto,
        );
      case TransactionMethods.BalanceCreateTransaction:
        return await this.BalanceCreateTransaction(reqBody as unknown as BalanceCreateTransactionDto);
      case TransactionMethods.BalancePerformTransaction:
        return await this.BalancePerformTransaction(reqBody as BalancePerformTransactionDto);
      case TransactionMethods.BalanceCancelTransaction:
        return await this.BalanceCancelTransaction(reqBody as BalanceCancelTransactionDto);
      case TransactionMethods.BalanceGetStatement:
        return await this.BalanceGetStatement(reqBody as unknown as BalanceGetStatementDto);
      case TransactionMethods.BalanceCheckTransaction:
        return await this.BalanceCheckTransaction(reqBody as BalanceCheckTransactionDto);
      default:
        return { error: 'Invalid transaction method' };
    }
  }

  async BalanceCheckPerformTransaction(
    BalanceCheckPerformTransactionDto: BalanceCheckPerformTransactionDto,
  ) {
    return BalanceCheckPerformTransaction.call(this, BalanceCheckPerformTransactionDto);
  }

  async BalanceCreateTransaction(
    CreateTransactionDto: BalanceCreateTransactionDto,
  ) {
    return BalanceCreateTransaction.call(this, CreateTransactionDto);
  }

  async BalanceCheckTransaction(checkTransactionDto: BalanceCheckTransactionDto) {
    return BalanceCheckTransaction.call(this, checkTransactionDto);
  }

  async BalancePerformTransaction(performTransactionDto: BalancePerformTransactionDto) {
    return BalancePerformTransaction.call(this, performTransactionDto);
  }

  async BalanceCancelTransaction(BalanceCancelTransactionDto: BalanceCancelTransactionDto) {
    return BalanceCancelTransaction.call(this, BalanceCancelTransactionDto);
  }

  async BalanceGetStatement(getStatementDto: BalanceGetStatementDto) {
    return BalanceGetStatement.call(this, getStatementDto);
  }

  private checkTransactionExpiration(created_at: Date) {
    const transactionCreatedAt = new Date(created_at);
    const timeoutDuration = 300;
    const timeoutThreshold = DateTime.now()
      .minus({
        minutes: timeoutDuration,
      })
      .toJSDate();

    return transactionCreatedAt < timeoutThreshold;
  }
}
