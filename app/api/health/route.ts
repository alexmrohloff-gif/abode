import { NextResponse } from "next/server";
import { GetSystemHealthUseCase } from "../../../src/application/use-cases/get-system-health-use-case";

const getSystemHealthUseCase = new GetSystemHealthUseCase();

export async function GET() {
  const result = await getSystemHealthUseCase.execute();
  return NextResponse.json(result);
}

