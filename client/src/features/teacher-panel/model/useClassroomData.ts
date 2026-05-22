import { useState, useEffect, useCallback } from "react"
import { getClassroomLogs, getClassroomStats } from "@/shared/api/classroom"

interface UseClassroomDataReturn {
    logs: any[]
    stats: any | null
    expiresAt: string | null
    logsPage: number
    logsTotal: number
    logsTotalPages: number
    isLoading: boolean
    error: string | null
    loadLogs: (page: number, filters?: Record<string, string | undefined>) => void
    refreshAll: () => void
    refreshStatsOnly: () => void
}

export const useClassroomData = (code: string): UseClassroomDataReturn => {
    const [logs, setLogs] = useState<any[]>([])
    const [stats, setStats] = useState<any | null>(null)
    const [expiresAt, setExpiresAt] = useState<string | null>(null)
    const [logsPage, setLogsPage] = useState(1)
    const [logsTotal, setLogsTotal] = useState(0)
    const [logsTotalPages, setLogsTotalPages] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const loadLogs = useCallback(async (page: number, filters?: any) => {
        setIsLoading(true)
        try {
            const data = await getClassroomLogs(code, page, 10, filters)
            setLogs(data.logs)
            setLogsPage(data.page)
            setLogsTotal(data.total)
            setLogsTotalPages(data.total_pages)
        } catch {
            setError("Не удалось загрузить логи")
        } finally {
            setIsLoading(false)
        }
    }, [code])

    const loadStats = useCallback(async () => {
        try {
            const data = await getClassroomStats(code)
            setStats(data.stats)
            if (data.expires_at) {
                setExpiresAt(data.expires_at)
            }
        } catch {
         
        }
    }, [code])

    const refreshStatsOnly = useCallback(() => {
        loadStats()
    }, [loadStats])

    const refreshAll = useCallback(() => {
        setError(null)
        loadLogs(logsPage)
        loadStats()
    }, [loadLogs, loadStats, logsPage])

    useEffect(() => {
        setLogs([])
        setStats(null)
        setError(null)
        setLogsPage(1)
        loadLogs(1)
        loadStats()
    }, [code, loadLogs, loadStats])

    return {
        logs, stats, expiresAt,
        logsPage, logsTotal, logsTotalPages,
        isLoading, error,
        loadLogs, refreshAll, refreshStatsOnly
    }
}
