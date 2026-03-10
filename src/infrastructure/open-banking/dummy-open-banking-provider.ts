import type {
  LinkedAccount,
  OpenBankingProvider
} from "../../domain/services/open-banking";

export class DummyOpenBankingProvider implements OpenBankingProvider {
  async linkAccount(_userId: string): Promise<LinkedAccount> {
    throw new Error("Not implemented");
  }

  /** Mock: returns a fixed balance for testing (e.g. 50000 = £500). Replace with real API in production. */
  async checkBalance(userId: string): Promise<{ balanceCents: number; currency: string }> {
    void userId;
    return { balanceCents: 50_000, currency: "GBP" };
  }

  async getTransactions(_accountId: string): Promise<unknown[]> {
    throw new Error("Not implemented");
  }

  async initiatePayment(): Promise<{ paymentId: string }> {
    throw new Error("Not implemented");
  }
}

