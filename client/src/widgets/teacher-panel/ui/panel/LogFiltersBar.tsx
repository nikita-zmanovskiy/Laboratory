import { IMAGE_FILTER_OPTIONS, MODE_FILTER_OPTIONS, SORT_OPTIONS, STATUS_FILTER_OPTIONS } from "@/shared/config/teacherPanel"
import { CustomSelect } from "@/shared/ui/custom-select/ui/CustomSelect"

import { LogFiltersBarProps } from "../../types"

export const LogFiltersBar = ({
    searchQuery,
    onSearchChange,
    modeFilter,
    onModeFilterChange,
    statusFilter,
    onStatusFilterChange,
    imageFilter,
    onImageFilterChange,
    sortOrder,
    onSortOrderChange,
    hasActiveFilters,
    isRefreshing,
    isInitialLoading,
    filteredLogsCount,
    logsTotal,
    onRefreshFiltered,
    onResetFilters,
}: LogFiltersBarProps) => (
    <div className="p-4 flex flex-wrap max-[750px]:!justify-center items-center gap-3 border-b border-[var(--color-border-primary)]">
        <input
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Поиск по ID сессии..."
            className="rounded-xl bg-[var(--color-bg-hover)] border border-[var(--color-border-primary)] px-3 py-1.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none"
        />
        <CustomSelect
            compact
            value={modeFilter}
            options={[...MODE_FILTER_OPTIONS]}
            onChange={onModeFilterChange}
        />
        <CustomSelect
            compact
            value={statusFilter}
            options={[...STATUS_FILTER_OPTIONS]}
            onChange={onStatusFilterChange}
        />
        <CustomSelect
            compact
            value={imageFilter}
            options={[...IMAGE_FILTER_OPTIONS]}
            onChange={onImageFilterChange}
        />
        <CustomSelect
            compact
            value={sortOrder}
            options={[...SORT_OPTIONS]}
            onChange={onSortOrderChange}
        />
        <div
            className={`flex min-h-[36px] min-w-[360px] items-center gap-3 transition-opacity duration-200
                max-[520px]:min-w-full max-[520px]:justify-center max-[400px]:flex-wrap
                ${
                    hasActiveFilters
                        ? "visible opacity-100 pointer-events-auto"
                        : "invisible opacity-0 pointer-events-none"
                }
            `}
        >
            <button
                onClick={onRefreshFiltered}
                disabled={isRefreshing || isInitialLoading}
                className="rounded-xl cursor-pointer border border-[var(--color-accent)]/30 bg-[var(--color-accent-light)] px-4 py-2 text-sm text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
                {isRefreshing ? "Загрузка..." : "Обновить таблицу"}
            </button>
            <span className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">
                Найдено: {filteredLogsCount} из {logsTotal}
            </span>
            <button
                onClick={onResetFilters}
                className="rounded-lg cursor-pointer px-2 py-0.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors whitespace-nowrap"
            >
                Сбросить
            </button>
        </div>
    </div>
)
