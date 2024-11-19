import { ExpenseCreateTransactionDto } from "../../dto/expense/expenseCreateTransaction.dto";
import { PaymeError } from '../../constants/payme-error';
import { TransactionState } from '../../constants/transaction-state';
import { ExpenseCheckPerformTransactionDto } from "../../dto/expense/expenseCheckPerformTransaction.dto";
import { TransactionMethods } from '../../constants/transaction-methods';
import { ErrorStatusCodes } from '../../constants/error-status-codes';
import { pay_system } from '@prisma/client';
import * as console from "node:console";

export async function ExpenseCreateTransaction(
  this: any,
  createTransactionDto: ExpenseCreateTransactionDto,
) {
  const package_id = Number(createTransactionDto.params?.account?.package_id);
  const amount = createTransactionDto.params.amount;
  const team_id = Number(createTransactionDto.params?.account?.team_id);
  const transaction_id = createTransactionDto.params.id;

  if (!package_id) {
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

  const pay_package = await this.prismaService.pay_package.findUnique({
    where: { id: package_id },
  });

  if (!pay_package) {
    return {
      error: {
        code: ErrorStatusCodes.TransactionNotAllowed,
        message: {
          uz: "Foydalanuvchi balansi yo'q",
          en: 'User balance does not exist',
          ru: 'Баланс пользователя не существует',
        },
      },
    };
  }

  const existingTransactions = await this.prismaService.pay_expense.findMany({
    where: { id: package_id, team_id: team_id },
  });

  if (!existingTransactions) {  // umuman transaction bo'lmasa
    const transId = await this.prismaService.pay_expense.findUnique({
      where: { transaction_id },
    });

    if (transId) {
      if (Number(transId.status) !== TransactionState.Pending) {
        return {
          error: PaymeError.CantDoOperation,
          id: transId.transaction_id,
        };
      }
      return {
        result: {
          balance: Number(transId.price),
          transaction: transId.transaction_id,
          state: TransactionState.Pending,
          create_time: new Date(transId.created_at).getTime(),
        },
      };
    }

    const checkTransaction: ExpenseCheckPerformTransactionDto = {
      method: TransactionMethods.BalanceCheckPerformTransaction,
      params: {
        amount: amount,
        account: {
          package_id: package_id.toString(),
          team_id: team_id.toString(),
        },
      },
    };

    const checkResult = await this.checkPerformTransaction(checkTransaction);

    if (checkResult.error) {
      return {
        error: checkResult.error,
        id: transId?.transaction_id,
      };
    }

    const {
      price,
      transaction_id: transactionId,
      created_at,
    } = await this.prismaService.pay_expense.create({
      data: {
        package_id,
        team_id,
        price: amount,
        transaction_id,
        state: TransactionState.Pending,
        status: TransactionState.Pending.toString(),
        system: pay_system.payme,
        created_at: new Date(Date.now()),
        updated_at: new Date(Date.now()),
      },
    });

    return {
      result: {
        balance: Number(price), // Big Int => Number,
        transaction: transactionId,
        state: TransactionState.Pending,
        create_time: new Date(created_at).getTime(),
      },
    };
  }

  const team_season = await this.prismaService.team.findUnique({
    where: { team_id: team_id },
  });

  const teamSeason = team_season?.season_id;

  if (existingTransactions.length > 0) {
    if (existingTransactions.pay_package_id === pay_package.id){
      if (existingTransactions.pay_package_type === pay_package.type){
        return {
          error: {
            code: ErrorStatusCodes.TransactionNotAllowed,
            message: {
              "uz": "Siz ushbu package ni sotib ololmaysiz",
            },
          },
        };
      }
      console.log("sotib ol1")
    }
    console.log('sotib ol2')
  };



  const transId = await this.prismaService.pay_expense.findUnique({
    where: { transaction_id },
  });

  if (transId) {
    if (Number(transId.status) !== TransactionState.Pending) {
      return {
        error: PaymeError.CantDoOperation,
        id: transId.transaction_id,
      };
    }
    return {
      result: {
        balance: Number(transId.price),
        transaction: transId.transaction_id,
        state: TransactionState.Pending,
        create_time: new Date(transId.created_at).getTime(),
      },
    };
  }

  const checkTransaction: ExpenseCheckPerformTransactionDto = {
    method: TransactionMethods.ExpenseCheckPerformTransaction,
    params: {
      amount: amount,
      account: {
        package_id: package_id.toString(),
        team_id: team_id.toString(),
      },
    },
  };

  const checkResult = await this.checkPerformTransaction(checkTransaction);

  if (checkResult.error) {
    return {
      error: checkResult.error,
      id: transId?.transaction_id,
    };
  }

  const {
    price,
    transaction_id: transactionId,
    created_at,
  } = await this.prismaService.pay_balance.create({
    data: {
      package_id,
      team_id,
      price: amount,
      transaction_id,
      state: TransactionState.Pending,
      status: TransactionState.Pending.toString(),
      system: pay_system.payme,
      created_at: new Date(Date.now()),
      updated_at: new Date(Date.now()),
    },
  });


  return {
    result: {
      balance: Number(price), // Big Int => Number,
      transaction: transactionId,
      state: TransactionState.Pending,
      create_time: new Date(created_at).getTime(),
    },
  };
}
