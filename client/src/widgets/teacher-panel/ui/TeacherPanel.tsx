
import { NotificationToast } from "@/shared/ui/notification-toast/ui/NotificationToast"
import { LogFiltersBar } from "./panel/LogFiltersBar"
import { LogsTable } from "./panel/LogsTable"
import { RealtimeLogsPanel } from "./panel/RealtimeLogsPanel"
import { StatsCards } from "./panel/StatsCards"
import { TeacherPanelHeader } from "./panel/TeacherPanelHeader"
import { TeacherPanelModals } from "./panel/TeacherPanelModals"
import { ChartsSection } from "./ChartsSection"

import styles from "./teacher.module.css"
import { TeacherPanelProps } from "../types"


export const TeacherPanel = ({
    code,
    stats,
    logsPage,
    logsTotal,
    logsTotalPages,
    isInitialLoading,
    isRefreshing,
    actionError,
    isExtending,
    isDeactivating,
    onLoadLogs,
    onRefreshFiltered,
    hasActiveFilters,
    onExtend,
    onBack,
    realtimeLogs,
    isWsConnected,
    searchQuery,
    onSearchChange,
    modeFilter,
    onModeFilterChange,
    statusFilter,
    onStatusFilterChange,
    filteredLogs,
    imageFilter,
    onImageFilterChange,
    sortOrder,
    onSortOrderChange,
    isExporting,
    onExport,
    expiresAt,
    onOpenConfirm,
    onCloseConfirm,
    onConfirmDeactivate,
    showConfirm,
    isExpired,
    onExitToHome,
    notificationMessage,
    dismissNotification,
    showNotification,
    onResetFilters,
}: TeacherPanelProps) => (
    <main className={`w-full min-h-screen page__animation-opacity block overflow-x-hidden ${styles.teacher__wrapper}`}>
        <div className="mx-auto max-w-6xl px-4 py-6">
            {showNotification && (
                <NotificationToast
                    message={notificationMessage}
                    onClose={dismissNotification}
                />
            )}

            <TeacherPanelHeader
                code={code}
                stats={stats}
                expiresAt={expiresAt}
                isExtending={isExtending}
                isDeactivating={isDeactivating}
                onExtend={onExtend}
                onOpenConfirm={onOpenConfirm}
                onBack={onBack}
            />

            {actionError && (
                <p className="mb-4 text-sm text-[var(--color-text-error)]">{actionError}</p>
            )}

            <StatsCards stats={stats} />
            <RealtimeLogsPanel
                realtimeLogs={realtimeLogs}
                isWsConnected={isWsConnected}
            />

            <div className="rounded-xl border border-[var(--color-border-primary)] w-full">
                <LogFiltersBar
                    searchQuery={searchQuery}
                    onSearchChange={onSearchChange}
                    modeFilter={modeFilter}
                    onModeFilterChange={onModeFilterChange}
                    statusFilter={statusFilter}
                    onStatusFilterChange={onStatusFilterChange}
                    imageFilter={imageFilter}
                    onImageFilterChange={onImageFilterChange}
                    sortOrder={sortOrder}
                    onSortOrderChange={onSortOrderChange}
                    hasActiveFilters={hasActiveFilters}
                    isRefreshing={isRefreshing}
                    isInitialLoading={isInitialLoading}
                    filteredLogsCount={filteredLogs.length}
                    logsTotal={logsTotal}
                    onRefreshFiltered={onRefreshFiltered}
                    onResetFilters={onResetFilters}
                />
                <LogsTable
                    filteredLogs={filteredLogs}
                    logsPage={logsPage}
                    logsTotal={logsTotal}
                    logsTotalPages={logsTotalPages}
                    isInitialLoading={isInitialLoading}
                    isRefreshing={isRefreshing}
                    isExporting={isExporting}
                    onExport={onExport}
                    onLoadLogs={onLoadLogs}
                />
            </div>

            <ChartsSection stats={stats} />

            <TeacherPanelModals
                showConfirm={showConfirm}
                isDeactivating={isDeactivating}
                isExpired={isExpired}
                onConfirmDeactivate={onConfirmDeactivate}
                onCloseConfirm={onCloseConfirm}
                onExitToHome={onExitToHome}
            />
        </div>
    </main>
)
