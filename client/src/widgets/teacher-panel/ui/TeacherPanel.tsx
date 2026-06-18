import { NotificationToast } from "@/shared/ui/notification-toast"

import { TeacherPanelProps } from "../types"

import { LogFiltersBar } from "./panel/LogFiltersBar"
import { LogsTable } from "./panel/LogsTable"
import { RealtimeLogsPanel } from "./panel/RealtimeLogsPanel"
import { StatsCards } from "./panel/StatsCards"
import { TeacherPanelHeader } from "./panel/TeacherPanelHeader"
import { TeacherPanelModals } from "./panel/TeacherPanelModals"
import { ChartsSection } from "./ChartsSection"

import styles from "./teacher.module.css"

export const TeacherPanel = (props: TeacherPanelProps) => {
    const {
        code,
        stats,
        actionError,
        realtimeLogs,
        isWsConnected,
        filteredLogs,
        expiresAt,
        showNotification,
        notificationMessage,
        dismissNotification,
        showConfirm,
        isDeactivating,
        isExtending,
        isExpired,
        onExtend,
        onOpenConfirm,
        onBack,
        onConfirmDeactivate,
        onCloseConfirm,
        onExitToHome,
    } = props

    const headerProps = {
        code,
        stats,
        expiresAt,
        isExtending,
        isDeactivating,
        onExtend,
        onOpenConfirm,
        onBack,
    } satisfies React.ComponentProps<typeof TeacherPanelHeader>

    const filtersBarProps = {
        searchQuery: props.searchQuery,
        onSearchChange: props.onSearchChange,
        modeFilter: props.modeFilter,
        onModeFilterChange: props.onModeFilterChange,
        statusFilter: props.statusFilter,
        onStatusFilterChange: props.onStatusFilterChange,
        imageFilter: props.imageFilter,
        onImageFilterChange: props.onImageFilterChange,
        sortOrder: props.sortOrder,
        onSortOrderChange: props.onSortOrderChange,
        hasActiveFilters: props.hasActiveFilters,
        isRefreshing: props.isRefreshing,
        isInitialLoading: props.isInitialLoading,
        filteredLogsCount: filteredLogs.length,
        logsTotal: props.logsTotal,
        onRefreshFiltered: props.onRefreshFiltered,
        onResetFilters: props.onResetFilters,
    } satisfies React.ComponentProps<typeof LogFiltersBar>

    const logsTableProps = {
        filteredLogs,
        logsPage: props.logsPage,
        logsTotal: props.logsTotal,
        logsTotalPages: props.logsTotalPages,
        isInitialLoading: props.isInitialLoading,
        isRefreshing: props.isRefreshing,
        isExporting: props.isExporting,
        onExport: props.onExport,
        onLoadLogs: props.onLoadLogs,
    } satisfies React.ComponentProps<typeof LogsTable>

    const modalsProps = {
        showConfirm,
        isDeactivating,
        isExpired,
        onConfirmDeactivate,
        onCloseConfirm,
        onExitToHome,
    } satisfies React.ComponentProps<typeof TeacherPanelModals>

    return (
        <main className={`w-full min-h-screen page__animation-opacity block overflow-x-hidden ${styles.teacher__wrapper}`}>
            <div className="mx-auto max-w-6xl px-4 py-6">
                {showNotification && (
                    <NotificationToast
                        message={notificationMessage}
                        onClose={dismissNotification}
                    />
                )}

                <TeacherPanelHeader {...headerProps} />

                {actionError && (
                    <p className="mb-4 text-sm text-[var(--color-text-error)]">
                        {actionError}
                    </p>
                )}

                <StatsCards stats={stats} />

                <RealtimeLogsPanel
                    realtimeLogs={realtimeLogs}
                    isWsConnected={isWsConnected}
                />

                <div className="rounded-xl border border-[var(--color-border-primary)] w-full">
                    <LogFiltersBar {...filtersBarProps} />
                    <LogsTable {...logsTableProps} />
                </div>

                <ChartsSection stats={stats} />

                <TeacherPanelModals {...modalsProps} />
            </div>
        </main>
    )
}