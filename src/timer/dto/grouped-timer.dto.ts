// filepath: /c:/Dev/timer-api/src/timer/dto/grouped-timer.dto.ts
import { Timer, Project, Tag } from "@prisma/client";

export interface ExtendedTimer extends Timer {
  project: Project;
  tag: Tag;
}

export interface GroupedTimers {
  [key: string]: ExtendedTimer[];
}