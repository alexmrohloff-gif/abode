import type { EscalationService } from "../../domain/services/escalation";

/**
 * Mock implementation: logs only. Replace with real dashboard/notification in production.
 */
export class MockEscalationService implements EscalationService {
  async escalateToHousehold(params: {
    rentShareId: string;
    householdId: string;
    message: string;
  }): Promise<void> {
    // eslint-disable-next-line no-console
    console.log("[MockEscalation] escalateToHousehold", {
      rentShareId: params.rentShareId,
      householdId: params.householdId,
      message: params.message
    });
  }
}
