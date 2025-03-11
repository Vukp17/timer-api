import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSavedReportFilterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  fromDate?: string;

  @IsString()
  @IsOptional()
  toDate?: string;

  @IsArray()
  @IsOptional()
  projectIds?: number[];

  @IsArray()
  @IsOptional()
  tagIds?: number[];

  @IsArray()
  @IsOptional()
  clientIds?: number[];
}

export class SavedReportFilterResponseDto {
  id: number;
  name: string;
  fromDate?: string;
  toDate?: string;
  projectIds: number[];
  tagIds: number[];
  clientIds: number[];
  createdAt: Date;
  updatedAt: Date;
}
