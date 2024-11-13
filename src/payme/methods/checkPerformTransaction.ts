import { CheckPerformTransactionDto } from '../dto/check-perform-transaction.dto';
import { ErrorStatusCodes } from '../constants/error-status-codes';
import * as console from "node:console";

export async function checkPerformTransaction(
  this: any,
  checkPerformTransactionDto: CheckPerformTransactionDto,
) {
  const userId = checkPerformTransactionDto.params?.account?.user_id
    ? Number(checkPerformTransactionDto.params?.account?.user_id)
    : null;
  const price = checkPerformTransactionDto.params.amount;

  if (!userId) {
    return {
      error: {
        code: ErrorStatusCodes.InvalidAuthorization,
        message: {
          uz: 'Foydalanuvchi identifikatori kiritilmagan',
          en: 'User ID is missing',
          ru: 'Идентификатор пользователя отсутствует',
        },
      },
    };
  }

  const uzer_id = await this.prismaService.user.findUnique({
    where: { id: userId},
  });

  if (!uzer_id) {
    return {
      error: {
        code: ErrorStatusCodes.TransactionNotAllowed,
        message: {
          uz: "Transaction topilmadi",
          en: 'User balance does not exist',
          ru: 'Баланс пользователя не существует',
        },
      },
    };
  }

  const pkg = await this.prismaService.pay_expense.findFirst({
    where: {user_id: userId,  price: price},
  });

  if (!pkg) {
    return {
      error: {
        code: ErrorStatusCodes.InvalidAmount,
        message: {
          ru: 'Неверная сумма',
          uz: 'Incorrect amount',
          en: 'Incorrect amount',
        },
      },
    };
  }

  if (price < 1 || price > 999999999 ) {
    return {
      error: {
        code: ErrorStatusCodes.InvalidAmount,
        message: {
          ru: 'Неверная сумма',
          uz: 'Incorrect amount',
          en: 'Incorrect amount',
        },
      },
    };
  }

  return { result: { allow: true } };
}
