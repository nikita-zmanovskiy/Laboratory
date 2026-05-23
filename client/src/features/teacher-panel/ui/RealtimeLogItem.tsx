"use client"

import { useEffect, useState } from "react"
import type { LogEntry } from "../model/useWebSocketLogs"
import styles from "./teacher.module.css"

interface RealtimeLogItemProps {
    log: LogEntry
}

export const RealtimeLogItem = ({ log }: RealtimeLogItemProps) => {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const frame = requestAnimationFrame(() => setVisible(true))
        return () => cancelAnimationFrame(frame)
    }, [])

    return (
        <div
            className={`${styles.realtimeRow} flex items-center gap-3 rounded-lg bg-[var(--color-bg-hover)] px-3 py-1.5 text-xs ${
                visible ? styles.realtimeRowVisible : ""
            }`}
        >
            <span className="font-mono text-[var(--color-text-muted)]">
                {new Date(log.timestamp).toLocaleTimeString("ru-RU")}
            </span>
            <span className="text-[var(--color-text-primary)]">{log.mode === "text" ? "текст" : "изобр"}</span>
            <span className="font-mono text-[var(--color-text-secondary)]">
                {log.tokens_input}/{log.tokens_output}
            </span>
            <span
                className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                    log.status === 200
                        ? "bg-[var(--color-success)]/20 text-[var(--color-text-success)]"
                        : "bg-[var(--color-danger)]/20 text-[var(--color-text-error)]"
                }`}
            >
                {log.status}
            </span>
            <span className="text-[var(--color-text-muted)]">{log.response_time_ms}ms</span>
        </div>
    )
}
