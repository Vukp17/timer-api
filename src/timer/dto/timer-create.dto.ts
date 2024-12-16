

export interface TimerCreateDto {
    startTime: Date | string
    endTime?: Date | string | null
    duration?: number | null
    description?: string | null
    projectId?: number | null
    tagId?: number | null

}