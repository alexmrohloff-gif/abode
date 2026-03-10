/**
 * Abstraction for escalating overdue rent to the household dashboard.
 * Implement in infrastructure; cron service depends on this interface only.
 */
export interface EscalationService {
  escalateToHousehold(params: {
    rentShareId: string;
    householdId: string;
    message: string;
  }): Promise<void>;
}
