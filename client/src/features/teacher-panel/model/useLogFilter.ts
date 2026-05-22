import { useState, useMemo, useCallback } from "react"

interface LogEntry {
    id: number
    timestamp: string
    session_id: string
    mode: string
    tokens_input: number
    tokens_output: number
    status: number
    response_time_ms: number
}
interface UseLogFilterReturn {
    filteredLogs: LogEntry[]
    searchQuery: string
    setSearchQuery: (query: string) => void
    modeFilter: string
    setModeFilter: (mode: string) => void
    statusFilter: string
    setStatusFilter: (status: string) => void
    imageFilter: string
    setImageFilter: (filter: string) => void
    sortOrder: string
    setSortOrder: (order: string) => void
}

export const useLogFilter = (logs: LogEntry[]): UseLogFilterReturn => {
    const [searchQuery, setSearchQuery] = useState("")
    const [modeFilter, setModeFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")
    const [imageFilter, setImageFilter] = useState("all")
    const [sortOrder, setSortOrder] = useState("newest")

    const filteredLogs = useMemo(() => {
        let result = logs.filter((log) => {
            if (searchQuery && !log.session_id?.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false
            }
            if (modeFilter !== "all" && log.mode !== modeFilter) {
                return false
            }
            if (statusFilter === "success" && log.status !== 200) {
                return false
            }
            if (statusFilter === "error" && log.status === 200) {
                return false
            }
            if (imageFilter === "with_image" && !log.image_attached) {
                return false
            }
            if (imageFilter === "no_image" && log.image_attached) {
                return false
            }
            return true
        })
        result.sort((a, b) => {
            const diff = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            return sortOrder === "newest" ? diff : -diff
        })

        return result
    }, [logs, searchQuery, modeFilter, statusFilter, imageFilter, sortOrder])

    return {
        filteredLogs,
        searchQuery, setSearchQuery,
        modeFilter, setModeFilter,
        statusFilter, setStatusFilter,
        imageFilter, setImageFilter,
        sortOrder, setSortOrder,
    }
}