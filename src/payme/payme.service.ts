import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { TransactionMethods } from './constants/transaction-methods';
import { PrismaService } from 'src/prisma.service';
import { RequestBody } from './types/incoming-request-body';

import { BalanceCheckPerformTransactionDto } from './dto/balance/check-perform-transaction.dto';
import { BalanceGetStatementDto } from './dto/balance/get-statement.dto';
import { BalanceCancelTransactionDto } from '../payme/dto/balance/cancel-transaction.dto';
import { BalancePerformTransactionDto } from './dto/balance/perform-transaction.dto';
import { BalanceCheckTransactionDto } from './dto/balance/check-transaction.dto';
import { BalanceCreateTransactionDto } from './dto/balance/create-transaction.dto';

import { ExpenseCheckPerformTransactionDto } from './dto/expense/expenseCheckPerformTransaction.dto';
import { ExpenseGetStatementDto } from './dto/expense/expenseGetStatement.dto';
import { ExpenseCancelTransactionDto } from '../payme/dto/expense/expenseCanceltransaction.dto';
import { ExpensePerformTransactionDto } from './dto/expense/expensePerformTransaction.dto';
import { ExpenseCheckTransactionDto } from './dto/expense/expenseCheckTransaction.dto';
import { ExpenseCreateTransactionDto } from './dto/expense/expenseCreateTransaction.dto';

import { BalanceCheckPerformTransaction } from './methods/balance/checkPerformTransaction';
import { BalanceCreateTransaction } from './methods/balance/createTransaction';
import { BalanceCheckTransaction } from './methods/balance/checkTransaction';
import { BalancePerformTransaction } from './methods/balance/performTransaction';
import { BalanceCancelTransaction } from './methods/balance/cancelTransaction';
import { BalanceGetStatement } from './methods/balance/getStatement';

import { ExpenseCheckPerformTransaction } from './methods/expense/checkPerformTransaction';
import { ExpenseCreateTransaction } from './methods/expense/createTransaction';
import { ExpenseCheckTransaction } from './methods/expense/checkTransaction';
import { ExpensePerformTransaction } from './methods/expense/performTransaction';
import { ExpenseCancelTransaction } from './methods/expense/cancelTransaction';
import { ExpenseGetStatement } from './methods/expense/getStatement';

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
        return await this.BalanceCreateTransaction(
          reqBody as BalanceCreateTransactionDto,
        );
      case TransactionMethods.BalancePerformTransaction:
        return await this.BalancePerformTransaction(
          reqBody as BalancePerformTransactionDto,
        );
      case TransactionMethods.BalanceCancelTransaction:
        return await this.BalanceCancelTransaction(
          reqBody as BalanceCancelTransactionDto,
        );
      case TransactionMethods.BalanceGetStatement:
        return await this.BalanceGetStatement(
          reqBody as BalanceGetStatementDto,
        );
      case TransactionMethods.BalanceCheckTransaction:
        return await this.BalanceCheckTransaction(
          reqBody as BalanceCheckTransactionDto,
        );
      case TransactionMethods.ExpenseCheckPerformTransaction:
        return await this.ExpenseCheckPerformTransaction(
          reqBody as ExpenseCheckPerformTransactionDto,
        );
      case TransactionMethods.ExpenseCreateTransaction:
        return await this.ExpenseCreateTransaction(
          reqBody as ExpenseCreateTransactionDto,
        );
      case TransactionMethods.ExpensePerformTransaction:
        return await this.ExpensePerformTransaction(
          reqBody as ExpensePerformTransactionDto,
        );
      case TransactionMethods.ExpenseCancelTransaction:
        return await this.ExpenseCancelTransaction(
          reqBody as ExpenseCancelTransactionDto,
        );
      case TransactionMethods.ExpenseGetStatement:
        return await this.ExpenseGetStatement(
          reqBody as ExpenseGetStatementDto,
        );
      case TransactionMethods.ExpenseCheckTransaction:
        return await this.ExpenseCheckTransaction(
          reqBody as ExpenseCheckTransactionDto,
        );
      default:
        return { error: 'Invalid transaction method' };
    }
  }

  async BalanceCheckPerformTransaction(
    BalanceCheckPerformTransactionDto: BalanceCheckPerformTransactionDto,
  ) {
    return BalanceCheckPerformTransaction.call(
      this,
      BalanceCheckPerformTransactionDto,
    );
  }

  async BalanceCreateTransaction(
    CreateTransactionDto: BalanceCreateTransactionDto,
  ) {
    return BalanceCreateTransaction.call(this, CreateTransactionDto);
  }

  async BalanceCheckTransaction(
    BalancecheckTransactionDto: BalanceCheckTransactionDto,
  ) {
    return BalanceCheckTransaction.call(this, BalancecheckTransactionDto);
  }

  async BalancePerformTransaction(
    BalanseperformTransactionDto: BalancePerformTransactionDto,
  ) {
    return BalancePerformTransaction.call(this, BalanseperformTransactionDto);
  }

  async BalanceCancelTransaction(
    BalanceCancelTransactionDto: BalanceCancelTransactionDto,
  ) {
    return BalanceCancelTransaction.call(this, BalanceCancelTransactionDto);
  }

  async BalanceGetStatement(getStatementDto: BalanceGetStatementDto) {
    return BalanceGetStatement.call(this, getStatementDto);
  }

  async ExpenseCheckPerformTransaction(
    ExpenseCheckPerformTransactionDto: ExpenseCheckPerformTransactionDto,
  ) {
    return ExpenseCheckPerformTransaction.call(
      this,
      ExpenseCheckPerformTransactionDto,
    );
  }

  async ExpenseCreateTransaction(
    CreateTransactionDto: ExpenseCreateTransactionDto,
  ) {
    return ExpenseCreateTransaction.call(this, CreateTransactionDto);
  }

  async ExpenseCheckTransaction(
    ExpensecheckTransactionDto: ExpenseCheckTransactionDto,
  ) {
    return ExpenseCheckTransaction.call(this, ExpensecheckTransactionDto);
  }

  async ExpensePerformTransaction(
    ExpenseperformTransactionDto: ExpensePerformTransactionDto,
  ) {
    return ExpensePerformTransaction.call(this, ExpenseperformTransactionDto);
  }

  async ExpenseCancelTransaction(
    ExpensecancelTransactionDto: ExpenseCancelTransactionDto,
  ) {
    return ExpenseCancelTransaction.call(this, ExpensecancelTransactionDto);
  }

  async ExpenseGetStatement(getStatementDto: ExpenseGetStatementDto) {
    return ExpenseGetStatement.call(this, getStatementDto);
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
