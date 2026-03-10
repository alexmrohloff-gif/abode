import type { Flatshare } from "../../domain/entities/flatshare";
import type { FlatshareRepository } from "../../domain/repositories/flatshare-repository";
import type {
  CreateFlatshareRequestDto,
  CreateFlatshareResponseDto
} from "../dtos/flatshare-dtos";

export class CreateFlatshareUseCase {
  constructor(private readonly flatshareRepo: FlatshareRepository) {}

  async execute(_input: CreateFlatshareRequestDto): Promise<CreateFlatshareResponseDto> {
    // Implementation will be added later.
    throw new Error("Not implemented");
  }
}

