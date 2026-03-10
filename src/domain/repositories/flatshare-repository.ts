import type { Flatshare } from "../entities/flatshare";

export interface FlatshareRepository {
  findById(id: string): Promise<Flatshare | null>;
  save(flatshare: Flatshare): Promise<void>;
}
