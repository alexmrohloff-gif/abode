export interface CalculateRentSplitRequestDto {
  totalRentCents: number;
  memberIds: string[];
  /** Percentages per member (same order as memberIds); must sum to 100. */
  percentages: number[];
}

export interface CalculateRentSplitResponseDto {
  shares: { memberId: string; amountCents: number }[];
}

/**
 * Calculates rent share amounts in cents from total and percentages.
 * Rounds so sum of shares equals totalRentCents.
 */
export function calculateRentSplitShares(
  totalRentCents: number,
  percentages: number[]
): number[] {
  if (percentages.length === 0) return [];
  const sumPct = percentages.reduce((a, b) => a + b, 0);
  if (Math.abs(sumPct - 100) > 0.01) {
    throw new Error("Percentages must sum to 100");
  }
  const shares = percentages.map((p) => Math.floor((totalRentCents * p) / 100));
  const diff = totalRentCents - shares.reduce((a, b) => a + b, 0);
  if (diff !== 0 && shares.length > 0) {
    shares[0] += diff;
  }
  return shares;
}

export class CalculateRentSplitUseCase {
  async execute(
    input: CalculateRentSplitRequestDto
  ): Promise<CalculateRentSplitResponseDto> {
    if (input.memberIds.length !== input.percentages.length) {
      throw new Error("memberIds and percentages length must match");
    }
    const amounts = calculateRentSplitShares(input.totalRentCents, input.percentages);
    return {
      shares: input.memberIds.map((memberId, i) => ({
        memberId,
        amountCents: amounts[i] ?? 0
      }))
    };
  }
}

