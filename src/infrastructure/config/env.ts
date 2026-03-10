export interface Env {
  databaseUrl: string;
  openBankingProvider: string | undefined;
}

export const env: Env = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  openBankingProvider: process.env.OPEN_BANKING_PROVIDER
};

