"use server";

import { auth } from "../auth";
import { prisma } from "../src/infrastructure/prisma/client";
import { z } from "zod";
import { initiatePaymentForShare } from "../src/infrastructure/payment/mock-payment-service";

const RentShareStatusEnum = z.enum(["PENDING", "PAID", "FAILED"]);

const updateRentShareSchema = z.object({
  shareId: z.string().cuid(),
  status: RentShareStatusEnum.optional(),
  amountCents: z.number().int().min(0).optional()
});

export type UpdateRentShareInput = z.infer<typeof updateRentShareSchema>;

/**
 * Fetches the current user's household(s), their leases, and all associated RentShares.
 * Scoped so the user only sees data for households they belong to.
 */
export async function getHouseholdDashboardData() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", data: null };
  }

  const households = await prisma.household.findMany({
    where: {
      users: {
        some: { id: session.user.id }
      }
    },
    include: {
      leases: {
        include: {
          rentShares: {
            include: {
              tenant: {
                select: { id: true, email: true, name: true, firstName: true, lastName: true }
              }
            }
          }
        }
      }
    }
  });

  return { error: null, data: { households } };
}

/**
 * Updates a RentShare's status and/or amount. Validates input with Zod and ensures
 * the share belongs to a household the current user is a member of.
 */
export async function updateRentShare(
  shareId: string,
  payload: { status?: "PENDING" | "PAID" | "FAILED"; amountCents?: number }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", success: false };
  }

  const parsed = updateRentShareSchema.safeParse({ shareId, ...payload });
  if (!parsed.success) {
    return { error: parsed.error.flatten().message, success: false };
  }

  const { shareId: id, status, amountCents } = parsed.data;

  const share = await prisma.rentShare.findUnique({
    where: { id },
    include: {
      lease: {
        include: {
          household: {
            select: { id: true, users: { where: { id: session.user.id }, select: { id: true } } }
          }
        }
      }
    }
  });

  if (!share) {
    return { error: "Rent share not found", success: false };
  }

  const isMember = share.lease.household.users.some((u) => u.id === session.user!.id);
  if (!isMember) {
    return { error: "Forbidden: not a member of this household", success: false };
  }

  await prisma.rentShare.update({
    where: { id },
    data: {
      ...(status !== undefined && { status }),
      ...(amountCents !== undefined && { amountCents }),
      ...(status === "PAID" && { paymentDate: new Date() })
    }
  });

  return { error: null, success: true };
}

/**
 * Triggers payment for a RentShare via the (mocked) PaymentService.
 * Ensures the share belongs to the current user's household before initiating.
 */
export async function initiatePayment(shareId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", success: false, paymentId: undefined };
  }

  const share = await prisma.rentShare.findUnique({
    where: { id: shareId },
    include: {
      lease: {
        include: {
          household: {
            select: { id: true, users: { where: { id: session.user.id }, select: { id: true } } }
          }
        }
      }
    }
  });

  if (!share) {
    return { error: "Rent share not found", success: false, paymentId: undefined };
  }

  const isMember = share.lease.household.users.some((u) => u.id === session.user!.id);
  if (!isMember) {
    return { error: "Forbidden: not a member of this household", success: false, paymentId: undefined };
  }

  const result = await initiatePaymentForShare(shareId);
  if (!result.success) {
    return { error: "Payment initiation failed", success: false, paymentId: undefined };
  }

  return { error: null, success: true, paymentId: result.paymentId };
}

// --- Split configuration & create lease ---

const splitTenantSchema = z.object({
  userId: z.string().cuid(),
  percentage: z.number().min(0).max(100)
});

export const splitConfigSchema = z
  .object({
    totalRentPounds: z.number().positive("Total rent must be positive"),
    tenants: z
      .array(splitTenantSchema)
      .min(1, "At least one tenant required")
  })
  .refine(
    (data) => {
      const sum = data.tenants.reduce((s, t) => s + t.percentage, 0);
      return Math.abs(sum - 100) < 0.01;
    },
    { message: "Please ensure all rent is accounted for.", path: ["tenants"] }
  );

export type SplitConfigInput = z.infer<typeof splitConfigSchema>;

const createLeaseSchema = splitConfigSchema.and(
  z.object({
    householdId: z.string().cuid(),
    propertyLabel: z.string().min(1),
    dueDayOfMonth: z.number().int().min(1).max(28),
    landlordName: z.string().min(1),
    startDate: z.coerce.date()
  })
);

/**
 * Creates a Lease and RentShares from validated split config. Caller must ensure
 * tenant userIds belong to the household.
 */
export async function createLease(
  householdId: string,
  leaseDetails: {
    propertyLabel: string;
    totalRentPounds: number;
    dueDayOfMonth: number;
    landlordName: string;
    startDate: Date;
  },
  splits: { userId: string; percentage: number }[]
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", data: null };
  }

  const parsed = createLeaseSchema.safeParse({
    householdId,
    propertyLabel: leaseDetails.propertyLabel,
    totalRentPounds: leaseDetails.totalRentPounds,
    dueDayOfMonth: leaseDetails.dueDayOfMonth,
    landlordName: leaseDetails.landlordName,
    startDate: leaseDetails.startDate,
    tenants: splits
  });
  if (!parsed.success) {
    const msg = parsed.error.flatten().message;
    return { error: typeof msg === "string" ? msg : msg.tenants?.join(", ") ?? "Validation failed", data: null };
  }

  const { totalRentPounds, propertyLabel, dueDayOfMonth, landlordName, startDate, tenants } = parsed.data;
  const totalRentCents = Math.round(totalRentPounds * 100);

  const household = await prisma.household.findFirst({
    where: {
      id: householdId,
      users: { some: { id: session.user.id } }
    },
    select: { id: true }
  });
  if (!household) {
    return { error: "Household not found or access denied", data: null };
  }

  const firstDueDate = new Date(startDate);
  firstDueDate.setDate(dueDayOfMonth);
  if (firstDueDate < startDate) {
    firstDueDate.setMonth(firstDueDate.getMonth() + 1);
  }

  const lease = await prisma.lease.create({
    data: {
      householdId,
      propertyLabel,
      totalRentCents,
      currency: "GBP",
      dueDayOfMonth,
      landlordName,
      startDate,
      rentShares: {
        create: tenants.map((t) => ({
          tenantId: t.userId,
          amountCents: Math.round((totalRentCents * t.percentage) / 100),
          dueDate: firstDueDate,
          status: "PENDING"
        }))
      }
    },
    select: { id: true }
  });

  return { error: null, data: { leaseId: lease.id } };
}
