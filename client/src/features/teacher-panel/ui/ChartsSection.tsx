import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import type { ClassroomStats } from "@/shared/api/classroom"
import styles from './teacher.module.css'

interface ChartsSectionProps {
    stats: ClassroomStats | null
}

const EmptyChart = ({ label }: { label: string }) => (
    <div className="flex items-center justify-center h-[200px]">
        <p className="text-sm text-[var(--color-text-muted)]">Нет данных для отображения</p>
    </div>
)

const EmptyPie = ({ label }: { label: string }) => (
    <div className="flex items-center justify-center h-[180px]">
        <p className="text-sm text-[var(--color-text-muted)]">Нет данных для отображения</p>
    </div>
)

export const ChartsSection = ({ stats }: ChartsSectionProps) => {
    if (!stats?.charts) return null

    const { charts, top_students } = stats

    return (
        <div className="space-y-6 mt-6">
            <div className="rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-hover)] p-4">
                <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">Запросы по минутам</h3>
                {charts.requests_per_minute?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={charts.requests_per_minute}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-primary)" />
                            <XAxis dataKey="minute" tick={{ fontSize: 12 }} stroke="var(--color-text-muted)" />
                            <YAxis tick={{ fontSize: 12 }} stroke="var(--color-text-muted)" />
                            <Tooltip contentStyle={{ background: "var(--color-bg-tertiary)", border: "1px solid var(--color-border-primary)", borderRadius: 12, color: "var(--color-text-primary)" }} />
                            <Bar dataKey="count" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <EmptyChart label="запросов по минутам" />
                )}
            </div>

            <div className="rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-hover)] p-4">
                <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">Токены по времени</h3>
                {charts.tokens_over_time?.length > 0 ? (
                    <>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={charts.tokens_over_time}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-primary)" />
                                <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} stroke="var(--color-text-muted)" />
                                <YAxis tick={{ fontSize: 12 }} stroke="var(--color-text-muted)" />
                                <Tooltip contentStyle={{ background: "var(--color-bg-tertiary)", border: "1px solid var(--color-border-primary)", borderRadius: 12, color: "var(--color-text-primary)" }} />
                                <Line type="monotone" dataKey="input" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="output" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                        <div className="mt-2 flex gap-4 text-xs">
                            <span className="flex items-center gap-1 text-[var(--color-text-secondary)]"><span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" /> Входные</span>
                            <span className="flex items-center gap-1 text-[var(--color-text-secondary)]"><span className="h-2 w-2 rounded-full bg-purple-500" /> Выходные</span>
                        </div>
                    </>
                ) : (
                    <EmptyChart label="токенов по времени" />
                )}
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-hover)] p-4">
                    <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">Режимы запросов</h3>
                    {(charts.mode_distribution?.text > 0 || charts.mode_distribution?.image > 0) ? (
                        <>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie data={[
                                        { name: "Текст", value: charts.mode_distribution.text },
                                        { name: "Изображения", value: charts.mode_distribution.image },
                                    ]} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                                        <Cell fill="var(--color-accent)" />
                                        <Cell fill="#8b5cf6" />
                                    </Pie>
                                    <Tooltip contentStyle={{ background: "var(--color-bg-tertiary)", border: "1px solid var(--color-border-primary)", borderRadius: 12, color: "var(--color-text-primary)" }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex justify-center gap-4 text-xs">
                                <span className="flex items-center gap-1 text-[var(--color-text-secondary)]"><span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" /> Текст: {charts.mode_distribution.text}</span>
                                <span className="flex items-center gap-1 text-[var(--color-text-secondary)]"><span className="h-2 w-2 rounded-full bg-purple-500" /> Изобр: {charts.mode_distribution.image}</span>
                            </div>
                        </>
                    ) : (
                        <EmptyPie label="режимов запросов" />
                    )}
                </div>

                <div className={`${styles.charts__top_students} rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-hover)] p-4`}>
                    <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">Топ учеников</h3>
                    {top_students?.length > 0 ? (
                        <div className="space-y-2">
                            {top_students.slice(0, 5).map((s, i: number) => (
                                <div key={s.session_id} className="flex items-center gap-2 text-xs">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent)]/20 text-[10px] font-bold text-[var(--color-accent)]">{i + 1}</span>
                                    <span className="flex-1 truncate font-mono text-[var(--color-text-secondary)]">{s.session_id}</span>
                                    <span className="font-medium text-[var(--color-text-primary)]">{s.requests} запр.</span>
                                    <span className="text-[var(--color-text-muted)]">{s.avg_tokens} ток.</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-[var(--color-text-muted)]">Нет данных</p>
                    )}
                </div>
            </div>
        </div>
    )
}
