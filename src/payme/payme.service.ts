import { Injectable } from '@nestjs/common';
import { TransactionMethods } from './constants/transaction-methods';
import { CheckPerformTransactionDto } from './dto/check-perform-transaction.dto';
import { PrismaService } from 'src/prisma.service';
import { RequestBody } from './types/incoming-request-body';
import { GetStatementDto } from './dto/get-statement.dto';
import { CancelTransactionDto } from './dto/cancel-transaction.dto';
import { PerformTransactionDto } from './dto/perform-transaction.dto';
import { CheckTransactionDto } from './dto/check-transaction.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { DateTime } from 'luxon';

import { checkPerformTransaction } from './methods/checkPerformTransaction';
import { createTransaction } from './methods/createTransaction';
import { checkTransaction } from './methods/checkTransaction';
import { performTransaction } from './methods/performTransaction';
import { cancelTransaction } from './methods/cancelTransaction';
import { getStatement } from './methods/getStatement';

export const CancelingReasons = {
  CanceledDueToTimeout: 'Canceled due to timeout',
};

@Injectable()
export class PaymeService {
  constructor(private readonly prismaService: PrismaService) {}

  async handleTransactionMethods(reqBody: RequestBody) {
    const method = reqBody.method;

    switch (method) {
      case TransactionMethods.CheckPerformTransaction:
        return await this.checkPerformTransaction(
          reqBody as CheckPerformTransactionDto,
        );
      case TransactionMethods.CreateTransaction:
        return await this.createTransaction(reqBody as CreateTransactionDto);
      case TransactionMethods.PerformTransaction:
        return await this.performTransaction(reqBody as PerformTransactionDto);
      case TransactionMethods.CancelTransaction:
        return await this.cancelTransaction(reqBody as CancelTransactionDto);
      case TransactionMethods.GetStatement:
        return await this.getStatement(reqBody as GetStatementDto);
      case TransactionMethods.CheckTransaction:
        return await this.checkTransaction(reqBody as CheckTransactionDto);
      default:
        return { error: 'Invalid transaction method' };
    }
  }

  async checkPerformTransaction(
    checkPerformTransactionDto: CheckPerformTransactionDto,
  ) {
    return checkPerformTransaction.call(this, checkPerformTransactionDto);
  }

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    const userId = Number(createTransactionDto.params?.account?.user_id);
    const amount = createTransactionDto.params.amount;
    if (!userId) {
      return {
        error: {
          code: ErrorStatusCodes.InvalidAuthorization,
          message: {
            uz: 'Noto‘g‘ri avtorizatsiya',        
            en: 'Invalid authorization',            
            ru: 'Неверная авторизация',
          },
        },
      };
    }
    
    const subid = await this.prismaService.usersub.findFirst({
      where: { id: userId },
    });
    
    const sub_id = subid.subs_id
    
    const balance = await this.prismaService.subscribtion.findFirst({
      where: { id: sub_id , price: amount}
    });
    console.log("balance", balance);
    
    if (!balance){
      return{
        error: {
          code: ErrorStatusCodes.InvalidAmount,
          message:{
            'ru': 'Неверная сумма',
            'uz': 'Incorrect amount',
            'en': 'Incorrect amount',
          },
        },
      };
    }

    if (typeof balance.price !== 'number' || balance.price < amount / 100) {
      return { error: PaymeError.InsufficientFunds };
    }


    const transId = await this.prismaService.pay_balance.findFirst({
      where: { transaction_id: createTransactionDto.params.id }
    })
    // console.log(transId)

    if (transId !== null && transId !== undefined) {
      console.log('ifdaman');
      
      if (transId.status !== 'pending') {
        return {
          error: PaymeError.CantDoOperation,
          id: transId.transaction_id,
        };
      }
      if (this.checkTransactionExpiration(transId.created_at)) {
        await this.prismaService.pay_balance.update({
          where: { id: transId.id },
          data: {
            status: 'canceled',
            canceled_at: new Date(),
            state: TransactionState.PendingCanceled,
          }
        })


        return {
          error: {
            ...PaymeError.CantDoOperation,
            state: TransactionState.PendingCanceled,
            reason: CancelingReasons.CanceledDueToTimeout,
          },
          id: transId.transaction_id,
        };
      }

      return {
        result: {
          balance: transId.price,
          transaction: transId.transaction_id,
          state: TransactionState.Pending,
          create_time: new Date(transId.created_at).getTime(),
        },
      };
    }

    const checkTransaction: CheckPerformTransactionDto = {
      method: TransactionMethods.CheckPerformTransaction,
      params: {
        amount: balance.price * 100,
        account: {
          user_id: userId.toString(),
        },
      },
    };

    const checkResult = await this.checkPerformTransaction(
      checkTransaction,
    );
    // console.log(checkResult);



    if (checkResult.error) {
      return {
        error: checkResult.error,
        id: transId.transaction_id,
      };
    }

    const newTransaction = await this.prismaService.pay_balance.create({
      data: {
        user_id: userId,
        price: balance.price -amount,
        transaction_id: createTransactionDto.params.id,
        state: 1, 
        created_at: new Date(),
        updated_at: new Date()
      },
    });
    console.log("n", newTransaction);


    return {
      result: {
        balance: newTransaction.price,
        transaction: createTransactionDto.params.id,
        state: TransactionState.Pending,
        create_time: new Date(newTransaction.created_at).getTime(),
      },
    };
    return createTransaction.call(this, createTransactionDto);
  }

  async checkTransaction(checkTransactionDto: CheckTransactionDto) {
    return checkTransaction.call(this, checkTransactionDto);
  }

  async performTransaction(performTransactionDto: PerformTransactionDto) {
    return performTransaction.call(this, performTransactionDto);
  }

  async cancelTransaction(cancelTransactionDto: CancelTransactionDto) {
    return cancelTransaction.call(this, cancelTransactionDto);
  }

  async getStatement(getStatementDto: GetStatementDto) {
    return getStatement.call(this, getStatementDto);
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
