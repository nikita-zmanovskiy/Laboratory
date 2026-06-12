
import { LogsTableProps } from "../../types"

import styles from "../teacher.module.css"

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
    if (!hash) {
        return "—"
    }

    return hash.length > 16 ? `${hash.slice(0, 16)}…` : hash
}

const formatErrorMessage = (message: string | null) => {
    if (!message) {
        return "—"
    }

    return message.length > 40 ? `${message.slice(0, 40)}…` : message
}


export const LogsTable = ({
    filteredLogs,
    logsPage,
    logsTotal,
    logsTotalPages,
    isInitialLoading,
    isRefreshing,
    isExporting,
    onExport,
    onLoadLogs,
}: LogsTableProps) => (
    <div className={styles.tableWrapper}>
        {isInitialLoading && (
            <div className="flex items-center justify-center py-16">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-border-primary)] border-t-[var(--color-accent)]" />
            </div>
        )}

        {!isInitialLoading && filteredLogs.length === 0 && !isRefreshing && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-4xl">...</span>
                <p className="mt-3 text-sm font-medium text-[var(--color-text-secondary)]">
                    Пока нет запросов
                </p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    Когда ученики начнут отправлять промпты, они появятся здесь
                </p>
            </div>
        )}

        {!isInitialLoading && (filteredLogs.length > 0 || isRefreshing) && (
            <div
                className={`animate-fadeIn ${styles.tableContent} ${
                    isRefreshing ? styles.tableRefreshing : ""
                }`}
            >
                {isRefreshing && (
                    <div className={styles.tableOverlay} aria-hidden="true">
                        <span className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-border-primary)] border-t-[var(--color-accent)]" />
                    </div>
                )}
                {filteredLogs.length > 0 && (
                    <>
                        <button
                            onClick={onExport}
                            disabled={isExporting}
                            className="m-4 rounded-xl cursor-pointer border border-[var(--color-border-primary)] px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] disabled:opacity-50 transition-colors"
                        >
                            {isExporting ? "Экспорт..." : "CSV"}
                        </button>
                        <div className={`${styles.tableScroll} block max-w-full overflow-x-auto scrollbar-thin`}>
                            <table className="w-full min-w-[960px] text-sm">
                                <thead>
                                    <tr className="border-b border-[var(--color-border-primary)]">
                                        {LOG_TABLE_HEADERS.map((header) => (
                                            <th
                                                key={header}
                                                className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)] whitespace-nowrap"
                                            >
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLogs.map((log, index) => (
                                        <tr
                                            key={log.id}
                                            className={`${styles.tableRow} border-b border-[var(--color-border-secondary)] hover:bg-[var(--color-bg-hover)]`}
                                            style={{
                                                animationDelay: `${Math.min(index, 12) * 30}ms`,
                                            }}
                                        >
                                            <td className="px-4 py-2 text-[var(--color-text-secondary)] whitespace-nowrap">
                                                {new Date(log.timestamp).toLocaleString("ru-RU")}
                                            </td>
                                            <td
                                                className="px-4 py-2 max-w-[140px] truncate font-mono text-xs text-[var(--color-text-muted)]"
                                                title={log.session_id}
                                            >
                                                {log.session_id}
                                            </td>
                                            <td className="px-4 py-2 text-[var(--color-text-primary)] whitespace-nowrap">
                                                {log.mode === "text" ? "текст" : "изобр"}
                                            </td>
                                            <td
                                                className="px-4 py-2 max-w-[120px] truncate font-mono text-xs text-[var(--color-text-muted)]"
                                                title={log.prompt_hash ?? undefined}
                                            >
                                                {formatPromptHash(log.prompt_hash)}
                                            </td>
                                            <td className="px-4 py-2 text-[var(--color-text-secondary)] whitespace-nowrap">
                                                {log.image_attached ? "да" : "нет"}
                                            </td>
                                            <td className="px-4 py-2 font-mono text-xs text-[var(--color-text-secondary)] whitespace-nowrap">
                                                {log.tokens_input ?? 0}/{log.tokens_output ?? 0}
                                            </td>
                                            <td className="px-4 py-2">
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                        log.status === 200
                                                            ? "bg-[var(--color-success)]/20 text-[var(--color-text-success)]"
                                                            : "bg-[var(--color-danger)]/20 text-[var(--color-text-error)]"
                                                    }`}
                                                >
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-[var(--color-text-muted)] whitespace-nowrap">
                                                {log.response_time_ms}ms
                                            </td>
                                            <td
                                                className="px-4 py-2 max-w-[200px] truncate text-xs text-[var(--color-text-error)]"
                                                title={log.error_message ?? undefined}
                                            >
                                                {formatErrorMessage(log.error_message)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {logsTotalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-[var(--color-border-primary)] px-4 py-3">
                                <p className="text-sm text-[var(--color-text-muted)]">
                                    Всего: {logsTotal} записей | Страница {logsPage} из {logsTotalPages}
                                </p>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => onLoadLogs(logsPage - 1)}
                                        disabled={logsPage === 1 || isRefreshing}
                                        className="rounded-lg px-3 py-1 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] disabled:opacity-30"
                                    >
                                        ←
                                    </button>
                                    {Array.from({ length: logsTotalPages }, (_, index) => index + 1)
                                        .filter(
                                            (page) =>
                                                page === 1 ||
                                                page === logsTotalPages ||
                                                Math.abs(page - logsPage) <= 1
                                        )
                                        .map((page, index, pages) => (
                                            <span key={page}>
                                                {index > 0 && pages[index - 1] !== page - 1 && (
                                                    <span className="px-1 text-[var(--color-text-muted)]">
                                                        ...
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => onLoadLogs(page)}
                                                    disabled={isRefreshing}
                                                    className={`rounded-lg px-3 py-1 text-sm ${
                                                        logsPage === page
                                                            ? "bg-[var(--color-accent)] text-[var(--color-text-primary)]"
                                                            : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]"
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            </span>
                                        ))}
                                    <button
                                        onClick={() => onLoadLogs(logsPage + 1)}
                                        disabled={logsPage === logsTotalPages || isRefreshing}
                                        className="rounded-lg px-3 py-1 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] disabled:opacity-30"
                                    >
                                        →
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        )}
    </div>
)
