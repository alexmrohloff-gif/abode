/**
 * Abstraction for sending rent reminder notifications (email / push).
 * Implement in infrastructure; cron service depends on this interface only.
 */
export interface ReminderNotificationService {
  sendLowFundsReminder(params: {
    rentShareId: string;
    userId: string;
    amountCents: number;
    dueDate: Date;
  }): Promise<void>;
}
