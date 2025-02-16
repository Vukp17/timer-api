// filepath: /c:/Dev/timer-api/src/timer/dto/grouped-timer.dto.ts
import { Timer, Project, Tag } from "@prisma/client";

export interface ExtendedTimer extends Timer {
  project: Project;
  tag: Tag;
}

export interface GroupedTimers {
  date: string;
  timers: ExtendedTimer[];
}

export interface WeeklyGroupedTimers {
  weekStart: string;
  weekEnd: string;
  totalHours: number;
  days: GroupedTimers[];
}

export interface WeeklyGroupedTimersResponse {
  weeklyTimers: WeeklyGroupedTimers[];
  totalCount: number;
}


export interface TimerCreateDto {
  startTime: Date | string
  endTime?: Date | string | null
  duration?: number | null
  description?: string | null
  projectId?: number | null
  tagId?: number | null

}