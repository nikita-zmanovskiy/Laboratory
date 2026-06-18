import { StatsCardsProps } from "../../types"



export const StatsCards = ({ stats }: StatsCardsProps) => {
    if (!stats?.charts) {
        return null
    }

    const itemsStats = [
        { label: "Текстовых запросов", value: stats.text_requests },
        { label: "Изображений", value: stats.image_requests },
        { label: "Среднее время ответа", value: `${stats.avg_response_time ?? 0}ms` },
        { label: "Средние токены", value: stats.charts.avg_tokens_per_request || 0 },
    ]

    return (
        <div className="mb-6 grid grid-cols-4 gap-4 max-[690px]:flex max-[690px]:flex-col">
            {itemsStats.map((item) => (
                <div
                    key={item.label}
                    className="rounded-xl border border-[var(--color-border-primary)] p-4"
                >
                    <p className="text-xs text-[var(--color-text-muted)]">{item.label}</p>
                    <p className="text-2xl font-bold max-[730px]:text-[20px] text-[var(--color-text-primary)]">
                        {item.value}
                    </p>
                </div>
            ))}
        </div>
    )
}
