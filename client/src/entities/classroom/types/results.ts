
import type { ClassroomLog, ClassroomStats } from "./models"

export interface ExtendClassroomResult {
    new_expires_at?: string
}

export interface ClassroomLogsResult {
    logs: ClassroomLog[]
    total: number
    page: number
    total_pages: number
}

export interface ClassroomStatsResult {
    stats: ClassroomStats
    expires_at?: string | null
}

export interface LogFilters {
    search?: string
    mode?: string
    status?: string
    image_attached?: string
    sort?: string
}