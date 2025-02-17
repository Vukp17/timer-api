import { IsDateString, IsOptional } from 'class-validator';

export class ReportRequestDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}

export class TimerReportRequestDto {
    fromDate?: string;
    toDate?: string;
    projectIds?: number[];
    tagIds?: number[];
    clientIds?: number[];
}

export interface ProjectAggregation {
    projectId: number;
    projectName: string;
    totalHours: number;
    percentage: number;
}

export interface TagAggregation {
    tagId: number;
    tagName: string;
    totalHours: number;
    percentage: number;
}

export interface ClientAggregation {
    clientId: number;
    clientName: string;
    totalHours: number;
    percentage: number;
}

export interface TimerReportResponse {
    totalHours: number;
    totalEarnings: number;
    byProject: ProjectAggregation[];
    byTag: TagAggregation[];
    byClient: ClientAggregation[];
    byDay: {
        date: string;
        hours: number;
        percentage: number;
        earnings: number;
    }[];
} 