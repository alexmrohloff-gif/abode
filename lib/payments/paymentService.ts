/**
 * Abstraction layer for payment operations.
 * Swap the provider via getPaymentProvider() or PAYMENT_PROVIDER env for production.
 */

export interface BalanceResult {
  balanceCents: number;
  currency: string;
}

export interface TransferTarget {
  /** e.g. IBAN or account identifier */
  accountId: string;
  currency?: string;
  reference?: string;
}

export type TransferResult =
  | { success: true; paymentId: string }
  | { success: false; code: "LOW_FUNDS"; message: string }
  | { success: false; code: "ERROR"; message: string };

export interface IPaymentProvider {
  checkBalance(userId: string): Promise<BalanceResult>;
  processTransfer(amountCents: number, target: TransferTarget): Promise<TransferResult>;
}

/**
 * Mock provider: simulated balances and transfers. Returns LOW_FUNDS when
 * amount exceeds a mock threshold (e.g. 100_000 cents = £1000).
 */
export class MockPaymentProvider implements IPaymentProvider {
  /** Mock balance returned for any userId (cents). */
  private readonly defaultBalanceCents = 75_000; // £750

  /** Transfers above this (cents) will return LOW_FUNDS. */
  private readonly lowFundsThresholdCents = 100_000; // £1000

  async checkBalance(userId: string): Promise<BalanceResult> {
    void userId;
    return {
      balanceCents: this.defaultBalanceCents,
      currency: "GBP"
    };
  }

  async processTransfer(amountCents: number, target: TransferTarget): Promise<TransferResult> {
    if (amountCents > this.lowFundsThresholdCents) {
      return {
        success: false,
        code: "LOW_FUNDS",
        message: "Insufficient funds for this transfer."
      };
    }
    return {
      success: true,
      paymentId: `mock_${target.accountId}_${Date.now()}`
    };
  }
}

let defaultProvider: IPaymentProvider | null = null;

/**
 * Factory: returns the current payment provider. Set PAYMENT_PROVIDER=production
 * (or similar) to swap to a real provider; otherwise returns MockPaymentProvider.
 */
export function getPaymentProvider(): IPaymentProvider {
  if (defaultProvider) return defaultProvider;
  const kind = process.env.PAYMENT_PROVIDER ?? "mock";
  if (kind === "production") {
    // Replace with: defaultProvider = new RealPaymentProvider();
    throw new Error("Production payment provider not configured. Implement and set PAYMENT_PROVIDER=production.");
  }
  defaultProvider = new MockPaymentProvider();
  return defaultProvider;
}

/**
 * For testing or explicit wiring: set the provider instance.
 */
export function setPaymentProvider(provider: IPaymentProvider): void {
  defaultProvider = provider;
}
