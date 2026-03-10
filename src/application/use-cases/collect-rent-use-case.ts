export interface CollectRentRequestDto {
  leaseId: string;
  collectionDate: Date;
}

export interface CollectRentResponseDto {
  collectionId: string;
}

export class CollectRentUseCase {
  async execute(_input: CollectRentRequestDto): Promise<CollectRentResponseDto> {
    // Implementation will be added later.
    throw new Error("Not implemented");
  }
}

