export interface CreateFlatshareRequestDto {
  name: string;
  memberEmails: string[];
}

export interface CreateFlatshareResponseDto {
  flatshareId: string;
}

