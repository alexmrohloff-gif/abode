import type { Tenant } from "../entities/tenant";

export interface TenantRepository {
  findById(id: string): Promise<Tenant | null>;
  findByEmail(email: string): Promise<Tenant | null>;
  save(tenant: Tenant): Promise<void>;
}
