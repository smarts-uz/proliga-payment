import { CheckTransactionDto } from '../dto/check-transaction.dto';

export async function checkTransaction(
  this: any,
  checkTransactionDto: CheckTransactionDto,
) {
  const transactionId = checkTransactionDto.params.id;

  const transaction = await this.prismaService.pay_balance.findFirst({
    where: { transaction_id: transactionId },
  });

  if (!transaction) {
    return {
      error: {
        code: 1008,
        message: {
          uz: 'Tranzaksiya topilmadi',
          en: 'Transaction not found',
          ru: 'Транзакция не найдена',
        },
      },
    };
  }

  return {
    result: {
      balance: transaction.price,
      transaction: transaction.transaction_id,
      state: transaction.state,
      create_time: transaction.created_at
        ? new Date(transaction.created_at).getTime()
        : null,
    },
  };
}
