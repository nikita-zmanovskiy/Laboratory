import type { ClassroomLog, ClassroomStats } from "@/entities/classroom/types"
import type { LogEntry } from "./models"

export interface TeacherPanelProps {
    code: string
    stats: ClassroomStats | null
    logsPage: number
    logsTotal: number
    logsTotalPages: number
    isInitialLoading: boolean
    isRefreshing: boolean
    actionError: string | null
    isExtending: boolean
    isDeactivating: boolean
    onLoadLogs: (page: number) => void
    onRefreshFiltered: () => void
    hasActiveFilters: boolean
    onExtend: (minutes: number) => void
    onBack: () => void
    realtimeLogs: LogEntry[]
    isWsConnected: boolean
    searchQuery: string
    onSearchChange: (query: string) => void
    modeFilter: string
    onModeFilterChange: (mode: string) => void
    statusFilter: string
    onStatusFilterChange: (status: string) => void
    filteredLogs: ClassroomLog[]
    imageFilter: string
    onImageFilterChange: (filter: string) => void
    sortOrder: string
    onSortOrderChange: (order: string) => void
    isExporting: boolean
    onExport: () => void
    expiresAt: string | null
    onOpenConfirm: () => void
    onCloseConfirm: () => void
    onConfirmDeactivate: () => void
    showConfirm: boolean
    isExpired: boolean
    onExitToHome: () => void
    showNotification: boolean
    notificationMessage: string
    dismissNotification: () => void
    onResetFilters: () => void
}

export interface RealtimeLogItemProps {
    log: LogEntry
}

export interface ChartsSectionProps {
    stats: ClassroomStats | null
}

export interface TeacherPanelModalsProps {
    showConfirm: boolean
    isDeactivating: boolean
    isExpired: boolean
    onConfirmDeactivate: () => void
    onCloseConfirm: () => void
    onExitToHome: () => void
}

export interface TeacherPanelHeaderProps {
    code: string
    stats: ClassroomStats | null
    expiresAt: string | null
    isExtending: boolean
    isDeactivating: boolean
    onExtend: (minutes: number) => void
    onOpenConfirm: () => void
    onBack: () => void
}

export interface StatsCardsProps {
    stats: ClassroomStats | null
}

export interface RealtimeLogsPanelProps {
    realtimeLogs: LogEntry[]
    isWsConnected: boolean
}

export interface LogsTableProps {
    filteredLogs: ClassroomLog[]
    logsPage: number
    logsTotal: number
    logsTotalPages: number
    isInitialLoading: boolean
    isRefreshing: boolean
    isExporting: boolean
    onExport: () => void
    onLoadLogs: (page: number) => void
}

export interface LogFiltersBarProps {
    searchQuery: string
    onSearchChange: (query: string) => void
    modeFilter: string
    onModeFilterChange: (mode: string) => void
    statusFilter: string
    onStatusFilterChange: (status: string) => void
    imageFilter: string
    onImageFilterChange: (filter: string) => void
    sortOrder: string
    onSortOrderChange: (order: string) => void
    hasActiveFilters: boolean
    isRefreshing: boolean
    isInitialLoading: boolean
    filteredLogsCount: number
    logsTotal: number
    onRefreshFiltered: () => void
    onResetFilters: () => void
}

export interface CopyCodeButtonProps {
    code: string
    copied: boolean
    onCopy: () => void
}