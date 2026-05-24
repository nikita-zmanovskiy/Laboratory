import { useCallback, useEffect, useRef,useState } from "react"

import {
    type ClassroomLog,
    type ClassroomStats,
    getClassroomLogs,
    getClassroomStats,
    type LogFilters,
} from "@/shared/api/classroom"

interface UseClassroomDataReturn {
    logs: ClassroomLog[]
    stats: ClassroomStats | null
    expiresAt: string | null
    logsPage: number
    logsTotal: number
    logsTotalPages: number
    isInitialLoading: boolean
    isRefreshing: boolean
    error: string | null
    loadLogs: (page: number, filters?: LogFilters) => void
    refreshAll: () => void
    refreshStatsOnly: () => void
}

export const useClassroomData = (code: string): UseClassroomDataReturn => {
    const [logs, setLogs] = useState<ClassroomLog[]>([]),
     [stats, setStats] = useState<ClassroomStats | null>(null),
     [expiresAt, setExpiresAt] = useState<string | null>(null),
     [logsPage, setLogsPage] = useState(1),
     [logsTotal, setLogsTotal] = useState(0),
     [logsTotalPages, setLogsTotalPages] = useState(0),
     [isInitialLoading, setIsInitialLoading] = useState(true),
     [isRefreshing, setIsRefreshing] = useState(false),
     [error, setError] = useState<string | null>(null),
     hasLoadedOnceRef = useRef(false)

    const loadLogs = useCallback(async (page: number, filters?: LogFilters) => {
        if (hasLoadedOnceRef.current) {
            setIsRefreshing(true)
        } else {
            setIsInitialLoading(true)
        }
        try {
            const data = await getClassroomLogs(code, page, 10, filters)
            setLogs(data.logs)
            setLogsPage(data.page)
            setLogsTotal(data.total)
            setLogsTotalPages(data.total_pages)
            hasLoadedOnceRef.current = true
        } catch {
            setError("Не удалось загрузить логи")
        } finally {
            setIsInitialLoading(false)
            setIsRefreshing(false)
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
        hasLoadedOnceRef.current = false
        setLogs([])
        setStats(null)
        setError(null)
        setLogsPage(1)
        setIsInitialLoading(true)
        setIsRefreshing(false)
        loadLogs(1)
        loadStats()
    }, [code, loadLogs, loadStats])

    return {
        logs, stats, expiresAt,
        logsPage, logsTotal, logsTotalPages,
        isInitialLoading, isRefreshing, error,
        loadLogs, refreshAll, refreshStatsOnly
    }
}
