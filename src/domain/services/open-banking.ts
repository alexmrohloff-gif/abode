export interface LinkedAccount {
  id: string;
  provider: string;
  displayName: string;
}

export interface BalanceResult {
  balanceCents: number;
  currency: string;
}

export interface OpenBankingProvider {
  linkAccount(userId: string): Promise<LinkedAccount>;
  checkBalance(userId: string): Promise<BalanceResult>;
  getTransactions(accountId: string): Promise<unknown[]>;
  initiatePayment(params: {
    fromAccountId: string;
    toAccountIban: string;
    amountCents: number;
    currency: string;
    reference: string;
  }): Promise<{ paymentId: string }>;
}

