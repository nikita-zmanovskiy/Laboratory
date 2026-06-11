import type { ClassroomLog, ClassroomStats, LogFilters } from "@/entities/classroom/types"

export interface LogEntry {
    id: number
    timestamp: string
    session_id: string
    mode: string
    prompt_hash: string
    image_attached: boolean
    tokens_input: number
    tokens_output: number
    status: number
    response_time_ms: number
    error_message: string | null
}

export interface UseWebSocketLogsReturn {
    realtimeLogs: LogEntry[]
    isConnected: boolean
    onNewLog: (callback: () => void) => void
}

export type RealtimeLogMessage = {
    type?: string
    log?: LogEntry
}

export interface UseCopyCodeReturn {
    copied: boolean
    handleCopy: () => void
}

export interface UseConfirmDeactivateReturn {
    showConfirm: boolean
    openConfirm: () => void
    closeConfirm: () => void
}

export interface UseClassroomDataReturn {
    logs: ClassroomLog[]
    stats: ClassroomStats | null
    expiresAt: string | null
    logsPage: number
    logsTotal: number
    logsTotalPages: number
    isInitialLoading: boolean
    isRefreshing: boolean
    error: string | null
    loadLogs: (page: number, filters?: LogFilters) => void
    refreshAll: () => void
    refreshStatsOnly: () => void
}

export interface UseClassroomActionsReturn {
    isExtending: boolean
    isDeactivating: boolean
    actionError: string | null
    isExporting: boolean
    handleExport: () => void
    handleExtend: (minutes: number) => Promise<void>
    handleDeactivate: () => Promise<void>
}

export type LogFiltersParams = {
    search?: string
    mode?: string
    status?: string
    image_attached?: string
    sort?: string
}