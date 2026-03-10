import { describe, it, expect, vi, beforeEach } from "vitest";
import { processRentReminders } from "./paymentCronService";
import type { PaymentCronServiceDeps } from "./paymentCronService";
import { calculateRentSplitShares } from "../../application/use-cases/calculate-rent-split-use-case";
import { CalculateRentSplitUseCase } from "../../application/use-cases/calculate-rent-split-use-case";

vi.mock("../prisma/client", () => ({
  prisma: {
    rentShare: {
      findMany: vi.fn(),
      update: vi.fn()
    }
  }
}));

import { prisma } from "../prisma/client";

describe("Split shares calculation", () => {
  it("Should calculate split shares correctly when 3 tenants have uneven splits (e.g., 40/30/30)", async () => {
    const totalCents = 100_000; // £1000
    const percentages = [40, 30, 30];
    const shares = calculateRentSplitShares(totalCents, percentages);
    expect(shares).toHaveLength(3);
    expect(shares[0]).toBe(40_000);
    expect(shares[1]).toBe(30_000);
    expect(shares[2]).toBe(30_000);
    expect(shares.reduce((a, b) => a + b, 0)).toBe(totalCents);

    const useCase = new CalculateRentSplitUseCase();
    const result = await useCase.execute({
      totalRentCents: 150_000,
      memberIds: ["user1", "user2", "user3"],
      percentages: [40, 30, 30]
    });
    expect(result.shares).toEqual([
      { memberId: "user1", amountCents: 60_000 },
      { memberId: "user2", amountCents: 45_000 },
      { memberId: "user3", amountCents: 45_000 }
    ]);
    expect(result.shares.reduce((s, x) => s + x.amountCents, 0)).toBe(150_000);
  });
});

describe("paymentCronService", () => {
  beforeEach(() => {
    vi.mocked(prisma.rentShare.findMany).mockReset();
    vi.mocked(prisma.rentShare.update).mockReset();
  });

  it("Should trigger 'Low Funds' warning when mocked bank balance < rent share", async () => {
    const now = new Date();
    const dueIn12h = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    vi.mocked(prisma.rentShare.findMany).mockResolvedValue([
      {
        id: "share1",
        leaseId: "lease1",
        tenantId: "user1",
        amountCents: 80_000,
        dueDate: dueIn12h,
        status: "PENDING",
        isLowFunds: false,
        lastNotifiedAt: null,
        createdAt: now,
        updatedAt: now,
        lease: { householdId: "hh1" },
        tenant: { id: "user1" }
      } as any
    ]);
    vi.mocked(prisma.rentShare.update).mockResolvedValue({} as any);

    const sendLowFundsReminder = vi.fn().mockResolvedValue(undefined);
    const deps: PaymentCronServiceDeps = {
      openBanking: {
        checkBalance: vi.fn().mockResolvedValue({ balanceCents: 50_000, currency: "GBP" })
      } as any,
      notifications: { sendLowFundsReminder } as any,
      escalation: { escalateToHousehold: vi.fn() } as any
    };

    await processRentReminders(deps);

    expect(prisma.rentShare.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "share1" },
        data: expect.objectContaining({
          isLowFunds: true,
          lastNotifiedAt: expect.any(Date)
        })
      })
    );
    expect(sendLowFundsReminder).toHaveBeenCalledWith(
      expect.objectContaining({
        rentShareId: "share1",
        userId: "user1",
        amountCents: 80_000
      })
    );
  });

  it("Should fail gracefully if the connection to the MockPaymentProvider is lost", async () => {
    const now = new Date();
    const dueIn12h = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    vi.mocked(prisma.rentShare.findMany).mockResolvedValue([
      {
        id: "share2",
        leaseId: "lease2",
        tenantId: "user2",
        amountCents: 30_000,
        dueDate: dueIn12h,
        status: "PENDING",
        isLowFunds: false,
        lastNotifiedAt: null,
        createdAt: now,
        updatedAt: now,
        lease: { householdId: "hh2" },
        tenant: { id: "user2" }
      } as any
    ]);

    const deps: PaymentCronServiceDeps = {
      openBanking: {
        checkBalance: vi.fn().mockRejectedValue(new Error("Connection lost"))
      } as any,
      notifications: { sendLowFundsReminder: vi.fn() } as any,
      escalation: { escalateToHousehold: vi.fn() } as any
    };

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(processRentReminders(deps)).resolves.not.toThrow();

    expect(prisma.rentShare.update).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      "[paymentCronService] job failed",
      "share2",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});
