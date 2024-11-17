import { Injectable } from '@nestjs/common';
import { TransactionMethods } from './constants/transaction-methods';
import { BalanceCheckPerformTransactionDto } from './dto/balance/check-perform-transaction.dto';
import { PrismaService } from 'src/prisma.service';
import { RequestBody } from './types/incoming-request-body';
import { BalanceGetStatemenDto } from './dto/balance/get-statement.dto';
import { BalanceCancelTransactionDto } from './dto/balance/cancel-transaction.dto';
import { BalancePerformTransactioDto } from './dto/balance/perform-transaction.dto';
import { BalanceCheckTransactionDto } from './dto/balance/check-transaction.dto';
import { BalanceCreateTransactionDto } from './dto/balance/create-transaction.dto';
import { DateTime } from 'luxon';

import { BalanceCheckPerformTransaction } from './methods/balance/BalanceCheckPerformTransaction';
import { BalanceCreateTransaction } from './methods/balance/createTransaction';
import { BalanceCheckTransaction } from './methods/balance/checkTransaction';
import { BalancePerformTransactio } from './methods/balance/performTransaction';
import { BalanceCancelTransaction } from './methods/balance/cancelTransaction';
import { BalanceGetStatemen } from './methods/balance/getStatement';

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
          reqBody as BalanceCheckPerformTransactionDto,
        );
      case TransactionMethods.BalanceCreateTransaction:
        return await this.BalanceCreateTransaction(reqBody as BalanceCreateTransactionDto);
      case TransactionMethods.BalancePerformTransactio:
        return await this.BalancePerformTransactio(reqBody as BalancePerformTransactioDto);
      case TransactionMethods.BalanceCancelTransaction:
        return await this.BalanceCancelTransaction(reqBody as BalanceCancelTransactionDto);
      case TransactionMethods.BalanceGetStatemen:
        return await this.BalanceGetStatemen(reqBody as BalanceGetStatemenDto);
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
    BalanceCreateTransactionDto: BalanceCreateTransactionDto,
  ) {
    return BalanceCreateTransaction.call(this, BalanceCreateTransactionDto);
  }

  async BalanceCheckTransaction(BalanceCheckTransactionDto: BalanceCheckTransactionDto) {
    return BalanceCheckTransaction.call(this, BalanceCheckTransactionDto);
  }

  async BalancePerformTransactio(BalancePerformTransactioDto: BalancePerformTransactioDto) {
    return BalancePerformTransactio.call(this, BalancePerformTransactioDto);
  }

  async BalanceCancelTransaction(BalanceCancelTransactionDto: BalanceCancelTransactionDto) {
    return BalanceCancelTransaction.call(this, BalanceCancelTransactionDto);
  }

  async BalanceGetStatemen(BalanceGetStatemenDto: BalanceGetStatemenDto) {
    return BalanceGetStatemen.call(this, BalanceGetStatemenDto);
  }

  private BalanceCheckTransactionExpiration(created_at: Date) {
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
