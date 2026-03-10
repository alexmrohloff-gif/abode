import type { PaymentCronServiceDeps } from "./paymentCronService";
import { startReminderScheduler, stopReminderScheduler } from "./paymentCronService";
import { DummyOpenBankingProvider } from "../open-banking/dummy-open-banking-provider";
import { MockReminderNotificationService } from "../notifications/mock-reminder-notification-service";
import { MockEscalationService } from "../escalation/mock-escalation-service";

/**
 * Default dependencies for the payment reminder cron.
 * Replace with real OpenBanking, email/push, and escalation implementations in production.
 */
export function getDefaultCronDeps(): PaymentCronServiceDeps {
  return {
    openBanking: new DummyOpenBankingProvider(),
    notifications: new MockReminderNotificationService(),
    escalation: new MockEscalationService()
  };
}

/**
 * Start the rent-reminder scheduler with default (mock) services.
 * Call from a Node process or a cron worker; do not require from UI.
 */
export function startPaymentReminderScheduler(intervalMs?: number): void {
  startReminderScheduler(getDefaultCronDeps(), intervalMs);
}

export { stopReminderScheduler };
