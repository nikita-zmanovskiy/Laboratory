import type { ClassroomLog, ClassroomStats } from "@/shared/api/classroom"
import { ClassroomClosedModal } from "@/shared/ui/ClassroomClosedModal"
import { CustomSelect } from "@/shared/ui/CustomSelect"
import { LessonTimer } from "@/shared/ui/LessonTimer"
import { NotificationToast } from "@/shared/ui/NotificationToast"
import { ConfirmModal } from "@/shared/ui/shared/ui/ConfirmModal"

import { LogEntry } from "../model/useWebSocketLogs"

import { ChartsSection } from "./ChartsSection"
import { CopyCodeContainer } from "./CopyCodeContainer"
import { RealtimeLogItem } from "./RealtimeLogItem"

import styles from './teacher.module.css'

const MODE_FILTER_OPTIONS = [
    { value: "all", label: "Все режимы" },
    { value: "text", label: "Текст" },
    { value: "image", label: "Изображение" },
] as const

const STATUS_FILTER_OPTIONS = [
    { value: "all", label: "Все статусы" },
    { value: "success", label: "Успешно" },
    { value: "error", label: "Ошибки" },
] as const

const SORT_OPTIONS = [
    { value: "newest", label: "Сначала новые" },
    { value: "oldest", label: "Сначала старые" },
] as const

const IMAGE_FILTER_OPTIONS = [
    { value: "all", label: "Все запросы" },
    { value: "with_image", label: "С изображением" },
    { value: "no_image", label: "Без изображения" },
] as const

const LOG_TABLE_HEADERS = [
    "Время",
    "Сессия",
    "Режим",
    "Хеш промта",
    "Прикрепленное фото",
    "Токены",
    "Статус",
    "Время ответа",
    "Ошибка",
] as const

const formatPromptHash = (hash: string | null) => {
    if (!hash) return "—"
    return hash.length > 16 ? `${hash.slice(0, 16)}…` : hash
}

const formatErrorMessage = (message: string | null) => {
    if (!message) return "—"
    return message.length > 40 ? `${message.slice(0, 40)}…` : message
}

interface TeacherPanelProps {
    code: string
    logs: ClassroomLog[]
    stats: ClassroomStats | null
    logsPage: number
    logsTotal: number
    logsTotalPages: number
    isInitialLoading: boolean
    isRefreshing: boolean
    error: string | null
    actionError: string | null
    isExtending: boolean
    isDeactivating: boolean
    onLoadLogs: (page: number) => void
    onRefreshFiltered: () => void
    hasActiveFilters: boolean
    onExtend: (minutes: number) => void
    onDeactivate: () => void
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

export const TeacherPanel = ({
    code, logs, stats, logsPage, logsTotal, logsTotalPages, isInitialLoading, isRefreshing, error, actionError,
    isExtending, isDeactivating, onLoadLogs, onRefreshFiltered, hasActiveFilters, onExtend, onDeactivate, onBack,
    realtimeLogs, isWsConnected, searchQuery, onSearchChange, modeFilter, onModeFilterChange,
    statusFilter, onStatusFilterChange, filteredLogs, imageFilter, onImageFilterChange,
    sortOrder, onSortOrderChange, isExporting, onExport, expiresAt, onOpenConfirm,
    onCloseConfirm, onConfirmDeactivate, showConfirm, isExpired, onExitToHome,
    notificationMessage, dismissNotification, showNotification,
    onResetFilters,
}: TeacherPanelProps) => (
    <div className={`${styles.logs__overlay} min-h-screen bg-[var(--color-bg-primary)] page__animation-opacity`}>
        <div className="mx-auto max-w-6xl px-4 py-6">
            {showNotification && <NotificationToast message={notificationMessage} onClose={dismissNotification} />}

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Класс: {code}</h1>
                        <CopyCodeContainer code={code} />
                    </div>
                    {stats && (
                        <p className="text-sm text-[var(--color-text-secondary)] mt-3">
                            Запросов: {stats?.total_requests || 0} | Учеников: {stats?.active_sessions || 0} | Ошибок: {stats?.error_rate || "0%"}
                        </p>
                    )}
                </div>
                <div className="flex gap-3">
                    {expiresAt && <LessonTimer expiresAt={expiresAt} />}
                    {expiresAt && new Date(expiresAt).getTime() - Date.now() < 12 * 60 * 60 * 1000 && (
                        <button onClick={() => onExtend(15)} disabled={isExtending}
                            className="rounded-xl cursor-pointer bg-[var(--color-success)]/20 border border-[var(--color-success)]/20 px-4 py-2 text-sm font-medium text-[var(--color-text-success)] hover:bg-[var(--color-success)]/30 disabled:opacity-50 transition-colors">
                            +15 мин
                        </button>
                    )}
                    {expiresAt && new Date(expiresAt).getTime() > Date.now() && (
                        <button onClick={onOpenConfirm} disabled={isDeactivating}
                            className="rounded-xl cursor-pointer bg-[var(--color-danger)]/20 border border-[var(--color-danger)]/20 px-4 py-2 text-sm font-medium text-[var(--color-text-error)] hover:bg-[var(--color-danger)]/30 disabled:opacity-50 transition-colors">
                            Завершить
                        </button>
                    )}
                    <button onClick={onBack}
                        className="rounded-xl cursor-pointer border border-[var(--color-border-primary)] px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors">
                        Назад
                    </button>
                </div>
            </div>

            {actionError && <p className="mb-4 text-sm text-[var(--color-text-error)]">{actionError}</p>}

            {stats?.charts && (
                <div className="mb-6 grid grid-cols-4 gap-4">
                    {[
                        { label: "Текстовых запросов", value: stats.text_requests },
                        { label: "Изображений", value: stats.image_requests },
                        { label: "Среднее время ответа", value: `${stats?.avg_response_time ?? 0}ms` },
                        { label: "Средние токены", value: stats.charts?.avg_tokens_per_request || 0 },
                    ].map((item) => (
                        <div key={item.label} className="rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-hover)] p-4">
                            <p className="text-xs text-[var(--color-text-muted)]">{item.label}</p>
                            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{item.value}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="mb-6 rounded-xl border border-[var(--color-accent)]/20 bg-[var(--color-accent-light)] p-4">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Последние запросы в реальном времени</h2>
                    <span className={`flex items-center gap-1.5 text-xs ${isWsConnected ? "text-[var(--color-text-success)]" : "text-[var(--color-text-error)]"}`}>
                        <span className={`h-2 w-2 rounded-full ${isWsConnected ? "bg-[var(--color-success)] animate-pulse" : "bg-[var(--color-danger)]"}`} />
                        {isWsConnected ? "Онлайн" : "Подключение..."}
                    </span>
                </div>
                {realtimeLogs.length === 0 ? (
                    <p className="text-xs text-[var(--color-text-muted)]">Ожидание запросов от учеников...</p>
                ) : (
                    <div className="space-y-1">
                        {realtimeLogs.map((log) => (
                            <RealtimeLogItem key={log.id} log={log} />
                        ))}
                    </div>
                )}
            </div>

            <div className="rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-hover)]">
                <div className="p-4 flex flex-wrap items-center gap-3 border-b border-[var(--color-border-primary)]">
                    <input type="text" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Поиск по ID сессии..."
                        className="rounded-xl bg-[var(--color-bg-hover)] border border-[var(--color-border-primary)] px-3 py-1.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none" />
                    <CustomSelect compact value={modeFilter} options={[...MODE_FILTER_OPTIONS]} onChange={onModeFilterChange} />
                    <CustomSelect compact value={statusFilter} options={[...STATUS_FILTER_OPTIONS]} onChange={onStatusFilterChange} />
                    <CustomSelect compact value={imageFilter} options={[...IMAGE_FILTER_OPTIONS]} onChange={onImageFilterChange} />
                    <CustomSelect compact value={sortOrder} options={[...SORT_OPTIONS]} onChange={onSortOrderChange} />
                    <div className={`flex items-center gap-3 transition-all duration-300 min-h-[36px] ${
                        hasActiveFilters 
                            ? "opacity-100 translate-y-0 max-w-md" 
                            : "opacity-0 -translate-y-2 max-w-0 overflow-hidden"
                    }`}>
                        <button onClick={onRefreshFiltered} disabled={isRefreshing || isInitialLoading}
                            className="rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-accent-light)] px-4 py-2 text-sm text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 disabled:opacity-50 transition-colors whitespace-nowrap">
                            {isRefreshing ? "Загрузка..." : "Обновить таблицу"}
                        </button>
                        <span className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">
                            Найдено: {filteredLogs.length} из {logsTotal}
                        </span>
                        <button onClick={onResetFilters}
                            className="rounded-lg px-2 py-0.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors whitespace-nowrap">
                            Сбросить
                        </button>
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    {isInitialLoading && (
                        <div className="flex items-center justify-center py-16">
                            <span className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-border-primary)] border-t-[var(--color-accent)]" />
                        </div>
                    )}

                    {!isInitialLoading && filteredLogs.length === 0 && !isRefreshing && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <span className="text-4xl">...</span>
                            <p className="mt-3 text-sm font-medium text-[var(--color-text-secondary)]">Пока нет запросов</p>
                            <p className="mt-1 text-xs text-[var(--color-text-muted)]">Когда ученики начнут отправлять промпты, они появятся здесь</p>
                        </div>
                    )}

                    {!isInitialLoading && (filteredLogs.length > 0 || isRefreshing) && (
                        <div className={`animate-fadeIn ${styles.tableContent} ${isRefreshing ? styles.tableRefreshing : ""}`}>
                            {isRefreshing && (
                                <div className={styles.tableOverlay} aria-hidden>
                                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-border-primary)] border-t-[var(--color-accent)]" />
                                </div>
                            )}
                            {filteredLogs.length > 0 && (
                                <>
                                    <button onClick={onExport} disabled={isExporting}
                                        className="m-4 rounded-xl cursor-pointer border border-[var(--color-border-primary)] px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] disabled:opacity-50 transition-colors">
                                        {isExporting ? "Экспорт..." : "CSV"}
                                    </button>
                                    <div className={styles.tableScroll}>
                                        <table className="w-full min-w-[960px] text-sm">
                                            <thead>
                                                <tr className="border-b border-[var(--color-border-primary)]">
                                                    {LOG_TABLE_HEADERS.map((h) => (
                                                        <th key={h} className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)] whitespace-nowrap">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredLogs.map((log, index) => (
                                                    <tr key={log.id} className={`${styles.tableRow} border-b border-[var(--color-border-secondary)] hover:bg-[var(--color-bg-hover)]`} style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}>
                                                        <td className="px-4 py-2 text-[var(--color-text-secondary)] whitespace-nowrap">{new Date(log.timestamp).toLocaleString("ru-RU")}</td>
                                                        <td className="px-4 py-2 max-w-[140px] truncate font-mono text-xs text-[var(--color-text-muted)]" title={log.session_id}>{log.session_id}</td>
                                                        <td className="px-4 py-2 text-[var(--color-text-primary)] whitespace-nowrap">{log.mode === "text" ? "текст" : "изобр"}</td>
                                                        <td className="px-4 py-2 max-w-[120px] truncate font-mono text-xs text-[var(--color-text-muted)]" title={log.prompt_hash ?? undefined}>{formatPromptHash(log.prompt_hash)}</td>
                                                        <td className="px-4 py-2 text-[var(--color-text-secondary)] whitespace-nowrap">{log.image_attached ? "да" : "нет"}</td>
                                                        <td className="px-4 py-2 font-mono text-xs text-[var(--color-text-secondary)] whitespace-nowrap">{log.tokens_input ?? 0}/{log.tokens_output ?? 0}</td>
                                                        <td className="px-4 py-2">
                                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${log.status === 200 ? "bg-[var(--color-success)]/20 text-[var(--color-text-success)]" : "bg-[var(--color-danger)]/20 text-[var(--color-text-error)]"}`}>
                                                                {log.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2 text-[var(--color-text-muted)] whitespace-nowrap">{log.response_time_ms}ms</td>
                                                        <td className="px-4 py-2 max-w-[200px] truncate text-xs text-[var(--color-text-error)]" title={log.error_message ?? undefined}>{formatErrorMessage(log.error_message)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {logsTotalPages > 1 && (
                                        <div className="flex items-center justify-between border-t border-[var(--color-border-primary)] px-4 py-3">
                                            <p className="text-sm text-[var(--color-text-muted)]">Всего: {logsTotal} записей | Страница {logsPage} из {logsTotalPages}</p>
                                            <div className="flex gap-1">
                                                <button onClick={() => onLoadLogs(logsPage - 1)} disabled={logsPage === 1 || isRefreshing}
                                                    className="rounded-lg px-3 py-1 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] disabled:opacity-30">←</button>
                                                {Array.from({ length: logsTotalPages }, (_, i) => i + 1)
                                                    .filter(p => p === 1 || p === logsTotalPages || Math.abs(p - logsPage) <= 1)
                                                    .map((p, i, arr) => (
                                                        <span key={p}>
                                                            {i > 0 && arr[i - 1] !== p - 1 && <span className="px-1 text-[var(--color-text-muted)]">...</span>}
                                                            <button onClick={() => onLoadLogs(p)} disabled={isRefreshing}
                                                                className={`rounded-lg px-3 py-1 text-sm ${logsPage === p ? "bg-[var(--color-accent)] text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]"}`}>{p}</button>
                                                        </span>
                                                    ))}
                                                <button onClick={() => onLoadLogs(logsPage + 1)} disabled={logsPage === logsTotalPages || isRefreshing}
                                                    className="rounded-lg px-3 py-1 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] disabled:opacity-30">→</button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <ChartsSection stats={stats} />

            {showConfirm && (
                <ConfirmModal title="Завершить урок?" message="Все ученики потеряют доступ к классу. Это действие нельзя отменить."
                    confirmLabel="Завершить" cancelLabel="Отмена" isLoading={isDeactivating}
                    onConfirm={onConfirmDeactivate} onCancel={onCloseConfirm} />
            )}
            {isExpired && <ClassroomClosedModal message="Время урока истекло" onExit={onExitToHome} />}
        </div>
    </div>
)
