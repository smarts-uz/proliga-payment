import { BalanceCheckPerformTransactionDto } from '../../dto/balance/check-perform-transaction.dto';
import { ErrorStatusCodes } from '../../constants/error-status-codes';

export async function BalanceCheckPerformTransaction(
  this: any,
  checkPerformTransactionDto: BalanceCheckPerformTransactionDto,
) {
  const userId = checkPerformTransactionDto.params?.account?.user_id
    ? Number(checkPerformTransactionDto.params?.account?.user_id)
    : null;
  const price = checkPerformTransactionDto.params.amount;
  const PAYME_MIN_AMOUNT = Number(process.env.PAYME_MIN_AMOUNT);
  const PAYME_MAX_AMOUNT = Number(process.env.PAYME_MAX_AMOUNT);

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

  const user_id = await this.prismaService.user.findUnique({
    where: { id: userId },
  });

  if (!user_id) {
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
