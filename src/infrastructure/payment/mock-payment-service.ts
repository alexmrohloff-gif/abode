import { prisma } from "../prisma/client";

/**
 * Mock PaymentService: loads RentShare and simulates initiating payment (e.g. Open Banking).
 * Replace with real payment flow in production.
 */
export async function initiatePaymentForShare(shareId: string): Promise<{ success: boolean; paymentId?: string }> {
  const share = await prisma.rentShare.findUnique({
    where: { id: shareId },
    include: { lease: true, tenant: true }
  });
  if (!share) return { success: false };
  // Mock: no real API call; in production would call OpenBankingProvider.initiatePayment(...)
  return { success: true, paymentId: `mock_${shareId}_${Date.now()}` };
}
