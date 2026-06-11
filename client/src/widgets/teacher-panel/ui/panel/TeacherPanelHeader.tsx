
import { LessonTimer } from "@/shared/ui/lesson-timer/ui/LessonTimer"

import { CopyCodeContainer } from "../copy-button/CopyCodeContainer"
import { TeacherPanelHeaderProps } from "../../types"

const EXTEND_WINDOW_MS = 12 * 60 * 60 * 1000


export const TeacherPanelHeader = ({
    code,
    stats,
    expiresAt,
    isExtending,
    isDeactivating,
    onExtend,
    onOpenConfirm,
    onBack,
}: TeacherPanelHeaderProps) => {
    const expiresTime = expiresAt ? new Date(expiresAt).getTime() : 0
    const canExtend = Boolean(expiresAt && expiresTime - Date.now() < EXTEND_WINDOW_MS)
    const canDeactivate = Boolean(expiresAt && expiresTime > Date.now())

    return (
        <div className="mb-6 flex items-center justify-between max-[690px]:flex-col max-[690px]:gap-3">
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-xl max-[730px]:text-lg font-bold text-[var(--color-text-primary)]">
                        Класс: {code}
                    </h1>
                    <CopyCodeContainer code={code} />
                </div>
                {stats && (
                    <p className="text-sm max-[730px]:text-xs text-[var(--color-text-secondary)] mt-3">
                        Запросов: {stats.total_requests || 0} | Учеников: {stats.active_sessions || 0} | Ошибок: {stats.error_rate || "0%"}
                    </p>
                )}
            </div>
            <div className="flex gap-3 max-[690px]:flex-col max-[690px]:w-full">
                {expiresAt && <LessonTimer expiresAt={expiresAt} />}
                {canExtend && (
                    <button
                        onClick={() => onExtend(15)}
                        disabled={isExtending}
                        className="rounded-xl max-[730px]:text-xs cursor-pointer bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 px-4 py-2 text-sm font-medium text-[var(--color-text-success)] hover:bg-[var(--color-success)]/30 disabled:opacity-50 transition-colors"
                    >
                        +15 мин
                    </button>
                )}
                {canDeactivate && (
                    <button
                        onClick={onOpenConfirm}
                        disabled={isDeactivating}
                        className="rounded-xl max-[730px]:text-xs cursor-pointer bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 px-4 py-2 text-sm font-medium text-[var(--color-text-error)] hover:bg-[var(--color-danger)]/30 disabled:opacity-50 transition-colors"
                    >
                        Завершить
                    </button>
                )}
                <button
                    onClick={onBack}
                    className="rounded-xl max-[730px]:text-xs cursor-pointer border border-[var(--color-border-primary)] px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors"
                >
                    Назад
                </button>
            </div>
        </div>
    )
}
