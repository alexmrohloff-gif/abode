import type { Lease } from "../entities/lease";

export interface LeaseRepository {
  findById(id: string): Promise<Lease | null>;
  save(lease: Lease): Promise<void>;
}
