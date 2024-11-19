import { ExpenseCheckPerformTransactionDto } from "../../dto/expense/expenseCheckPerformTransaction.dto";
import { ErrorStatusCodes } from '../../constants/error-status-codes';

export async function ExpenseCheckPerformTransaction(
  this: any,
  checkPerformTransactionDto: ExpenseCheckPerformTransactionDto,
) {
  const package_id = checkPerformTransactionDto.params?.account?.package_id
    ? Number(checkPerformTransactionDto.params?.account?.package_id)
    : null;
  const price = checkPerformTransactionDto.params.amount;
  const PAYME_MIN_AMOUNT = Number(process.env.PAYME_MIN_AMOUNT);
  const PAYME_MAX_AMOUNT = Number(process.env.PAYME_MAX_AMOUNT);

  if (!package_id) {
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

  const pay_package = await this.prismaService.pay_package.findUnique({
    where: { id: package_id },
  });

  if (!pay_package) {
    return {
      error: {
        code: ErrorStatusCodes.TransactionNotAllowed,
        message: {
          uz: 'Transaction topilmadi',
          en: 'User balance does not exist',
          ru: 'Баланс пользователя не существует',
        },
      },
    };
  }

  if (price < Number(PAYME_MIN_AMOUNT) || price > Number(PAYME_MAX_AMOUNT)) {
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
