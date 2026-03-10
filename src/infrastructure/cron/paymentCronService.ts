import type { OpenBankingProvider } from "../../domain/services/open-banking";
import type { ReminderNotificationService } from "../../domain/services/reminder-notifications";
import type { EscalationService } from "../../domain/services/escalation";
import { prisma } from "../prisma/client";

const HOUR_MS = 60 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * HOUR_MS;
const SEVENTY_TWO_HOURS_MS = 72 * HOUR_MS;

/** Job types for the reminder queue; processed asynchronously to keep cron run fast. */
type ReminderJob =
  | { type: "low_funds_check"; rentShareId: string; userId: string; amountCents: number; dueDate: Date }
  | { type: "escalation"; rentShareId: string; householdId: string };

export interface PaymentCronServiceDeps {
  openBanking: OpenBankingProvider;
  notifications: ReminderNotificationService;
  escalation: EscalationService;
}

/**
 * In-memory queue for reminder jobs. Decouples "find due shares" from "run side effects".
 * Replace with Redis/Bull or a message queue in production.
 */
const reminderQueue: ReminderJob[] = [];
let schedulerTimer: ReturnType<typeof setInterval> | null = null;

function enqueue(job: ReminderJob): void {
  reminderQueue.push(job);
}

async function processNextJob(deps: PaymentCronServiceDeps): Promise<void> {
  const job = reminderQueue.shift();
  if (!job) return;

  try {
    if (job.type === "low_funds_check") {
      await processLowFundsCheckJob(job, deps);
    } else {
      await processEscalationJob(job, deps);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[paymentCronService] job failed", job.rentShareId, err);
  }
}

async function processLowFundsCheckJob(
  job: Extract<ReminderJob, { type: "low_funds_check" }>,
  deps: PaymentCronServiceDeps
): Promise<void> {
  const balance = await deps.openBanking.checkBalance(job.userId);
  const isLowFunds = balance.balanceCents < job.amountCents;

  await prisma.rentShare.update({
    where: { id: job.rentShareId },
    data: {
      isLowFunds,
      lastNotifiedAt: isLowFunds ? new Date() : undefined
    }
  });

  if (isLowFunds) {
    await deps.notifications.sendLowFundsReminder({
      rentShareId: job.rentShareId,
      userId: job.userId,
      amountCents: job.amountCents,
      dueDate: job.dueDate
    });
  }
}

async function processEscalationJob(
  job: Extract<ReminderJob, { type: "escalation" }>,
  deps: PaymentCronServiceDeps
): Promise<void> {
  await deps.escalation.escalateToHousehold({
    rentShareId: job.rentShareId,
    householdId: job.householdId,
    message: "Rent share is overdue (still PENDING). Notify tenant or escalate."
  });
}

/**
 * Queries RentShare records whose dueDate is within 72h, 24h, or already due (including T+1h post-due),
 * and enqueues reminder / escalation jobs. Does not perform UI or HTTP; runs in background.
 */
export async function processRentReminders(deps: PaymentCronServiceDeps): Promise<void> {
  const now = new Date();
  const from = new Date(now.getTime() - 2 * HOUR_MS); // include up to 2h past due for escalation
  const to = new Date(now.getTime() + SEVENTY_TWO_HOURS_MS);

  const shares = await prisma.rentShare.findMany({
    where: {
      dueDate: { gte: from, lte: to },
      status: "PENDING"
    },
    include: {
      lease: { select: { householdId: true } },
      tenant: { select: { id: true } }
    }
  });

  for (const share of shares) {
    const dueTime = share.dueDate.getTime();

    // T+1h post-due: still PENDING -> escalate to household dashboard
    if (dueTime < now.getTime() - HOUR_MS) {
      enqueue({
        type: "escalation",
        rentShareId: share.id,
        householdId: share.lease.householdId
      });
      continue;
    }

    // T-24h: due within next 24h -> check balance, set is_low_funds, trigger email/push if low
    if (dueTime >= now.getTime() && dueTime <= now.getTime() + TWENTY_FOUR_HOURS_MS) {
      enqueue({
        type: "low_funds_check",
        rentShareId: share.id,
        userId: share.tenant.id,
        amountCents: share.amountCents,
        dueDate: share.dueDate
      });
    }
    // T-72h: due within 24–72h could trigger a generic "reminder" here if desired; not specified.
  }

  // Drain queue (process all enqueued jobs; decoupled from UI)
  while (reminderQueue.length > 0) {
    await processNextJob(deps);
  }
}

const DEFAULT_CRON_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Starts the scheduler that runs processRentReminders on an interval.
 * Stays decoupled from the UI; call from a Node process or API route used by a cron worker.
 */
export function startReminderScheduler(
  deps: PaymentCronServiceDeps,
  intervalMs: number = DEFAULT_CRON_INTERVAL_MS
): void {
  if (schedulerTimer) return;
  schedulerTimer = setInterval(() => {
    processRentReminders(deps).catch((err) => {
      // eslint-disable-next-line no-console
      console.error("[paymentCronService] processRentReminders failed", err);
    });
  }, intervalMs);
}

/**
 * Stops the reminder scheduler.
 */
export function stopReminderScheduler(): void {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
  }
}
