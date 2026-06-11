
import { RealtimeLogsPanelProps } from "../../types"
import { RealtimeLogItem } from "../RealtimeLogItem"


export const RealtimeLogsPanel = ({
    realtimeLogs,
    isWsConnected,
}: RealtimeLogsPanelProps) => (
    <div className="mb-6 rounded-xl border border-[var(--color-accent)]/20 bg-[var(--color-accent-light)] p-4">
        <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                Последние запросы в реальном времени
            </h2>
            <span
                className={`flex items-center gap-1.5 text-xs ${
                    isWsConnected
                        ? "text-[var(--color-text-success)]"
                        : "text-[var(--color-text-error)]"
                }`}
            >
                <span
                    className={`h-2 w-2 rounded-full ${
                        isWsConnected
                            ? "bg-[var(--color-success)] animate-pulse"
                            : "bg-[var(--color-danger)]"
                    }`}
                />
                {isWsConnected ? "Онлайн" : "Подключение..."}
            </span>
        </div>
        {realtimeLogs.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)]">
                Ожидание запросов от учеников...
            </p>
        ) : (
            <div className="space-y-1">
                {realtimeLogs.map((log) => (
                    <RealtimeLogItem key={log.id} log={log} />
                ))}
            </div>
        )}
    </div>
)
