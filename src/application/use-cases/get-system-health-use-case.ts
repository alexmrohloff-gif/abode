export interface SystemHealth {
  status: "ok";
}

export class GetSystemHealthUseCase {
  async execute(): Promise<SystemHealth> {
    return { status: "ok" };
  }
}

