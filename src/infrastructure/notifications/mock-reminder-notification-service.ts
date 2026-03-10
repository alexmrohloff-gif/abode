import type { ReminderNotificationService } from "../../domain/services/reminder-notifications";

/**
 * Mock implementation: logs only. Replace with real email/push (e.g. SendGrid, OneSignal) in production.
 */
export class MockReminderNotificationService implements ReminderNotificationService {
  async sendLowFundsReminder(params: {
    rentShareId: string;
    userId: string;
    amountCents: number;
    dueDate: Date;
  }): Promise<void> {
    // eslint-disable-next-line no-console
    console.log("[MockReminderNotification] sendLowFundsReminder", {
      rentShareId: params.rentShareId,
      userId: params.userId,
      amountCents: params.amountCents,
      dueDate: params.dueDate.toISOString()
    });
  }
}
