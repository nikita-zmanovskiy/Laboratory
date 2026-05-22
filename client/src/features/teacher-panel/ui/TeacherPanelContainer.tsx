"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useClassroomData } from "../model/useClassroomData"
import { useClassroomActions } from "../model/useClassroomActions"
import { useWebSocketLogs } from "../model/useWebSocketLogs"
import { useConfirmDeactivate } from "../model/useConfirmDeactivate"
import { useRoleStore } from "@/features/role-select"
import { useLessonTimer } from "../model/useLessonTimer"
import { useLessonNotification } from "@/shared/lib/useLessonNotification"
import { buildLogFilters, hasActiveLogFilters } from "../model/logFilters"
import { TeacherPanel } from "./TeacherPanel"

export const TeacherPanelContainer = ({ code }: { code: string }) => {
    const router = useRouter()

    const { logs, stats, logsPage, logsTotal, logsTotalPages, isLoading, error, loadLogs, refreshAll, refreshStatsOnly } = useClassroomData(code)
    const { isExtending, isDeactivating, actionError, handleExtend, handleExport, isExporting, handleDeactivate } = useClassroomActions(
        code, 
        refreshAll,
        (newExpiresAt) => {
            setExpiresAt(newExpiresAt)
            localStorage.setItem("expiresAt", newExpiresAt)
            
            const stored = localStorage.getItem("currentClass")
            if (stored) {
                try {
                    const parsed = JSON.parse(stored)
                    parsed.expires_at = newExpiresAt
                    localStorage.setItem("currentClass", JSON.stringify(parsed))
                } catch {}
            }
        }
    )
    const { realtimeLogs, isConnected, onNewLog } = useWebSocketLogs(code)
    const { showConfirm, openConfirm, closeConfirm } = useConfirmDeactivate()
    const resetRole = useRoleStore((state) => state.reset)

    const [expiresAt, setExpiresAt] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [modeFilter, setModeFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")
    const [imageFilter, setImageFilter] = useState("all")
    const [sortOrder, setSortOrder] = useState("newest")
    const [filtersClosing, setFiltersClosing] = useState(false)
    const skipFilterFetchOnMount = useRef(true)

    const hasActiveFilters = useMemo(
        () => hasActiveLogFilters(searchQuery, modeFilter, statusFilter, imageFilter),
        [searchQuery, modeFilter, statusFilter, imageFilter]
    )

    const getFilters = useCallback(
        () => buildLogFilters(searchQuery, modeFilter, statusFilter, imageFilter, sortOrder),
        [searchQuery, modeFilter, statusFilter, imageFilter, sortOrder]
    )

    const logout = useRoleStore((state) => state.logout)
    const role = useRoleStore((state) => state.role)
    const setRole = useRoleStore((state) => state.setRole)
    useEffect(() => {
        if (stats?.expires_at) {
            setExpiresAt(stats.expires_at)
        } else {
            const stored = localStorage.getItem("expiresAt")
            if (stored) setExpiresAt(stored)
        }
    }, [stats])

    useEffect(() => {
        if (filtersClosing) return
        if (skipFilterFetchOnMount.current) {
            skipFilterFetchOnMount.current = false
            return
        }

        const delay = searchQuery.trim() ? 350 : 0
        const timer = setTimeout(() => {
            loadLogs(1, getFilters())
        }, delay)

        return () => clearTimeout(timer)
    }, [searchQuery, modeFilter, statusFilter, imageFilter, sortOrder, loadLogs, getFilters, hasActiveFilters, filtersClosing])

    const { isExpired } = useLessonTimer(expiresAt)
    const { showNotification, notificationMessage, dismissNotification } = useLessonNotification(expiresAt)
    const handleRefreshFiltered = () => {
        loadLogs(1, getFilters())
    }

    const handleLoadLogsPage = (page: number) => {
        loadLogs(page, getFilters())
    }

    const resetFilters = () => {
        setFiltersClosing(true)
        setTimeout(() => {
            setSearchQuery("")
            setModeFilter("all")
            setStatusFilter("all")
            setImageFilter("all")
            setSortOrder("newest")
            setFiltersClosing(false)
        }, 300)
    }
    const handleConfirmDeactivate = async () => {
        await handleDeactivate()
        closeConfirm()
        resetRole()
        router.push("/")
    }

    const handleExitToHome = () => {
        resetRole()
        router.push("/")
    }

    useEffect(() => {
        if (!role) {
            setRole("teacher")
        } else if (role !== "teacher") {
            router.push("/")
        }
    }, [role, router, setRole])

    useEffect(() => {
        onNewLog(() => {
            if (hasActiveFilters) {
                refreshStatsOnly()
            } else {
                refreshAll()
            }
        })
    }, [onNewLog, hasActiveFilters, refreshAll, refreshStatsOnly])

    return (
        <TeacherPanel
            code={code}
            logs={logs}
            stats={stats}
            logsPage={logsPage}
            logsTotal={logsTotal}
            logsTotalPages={logsTotalPages}
            isLoading={isLoading}
            error={error}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            modeFilter={modeFilter}
            onModeFilterChange={setModeFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            hasActiveFilters={hasActiveFilters && !filtersClosing}
            filteredLogs={logs}
            actionError={actionError}
            isExtending={isExtending}
            isDeactivating={isDeactivating}
            onLoadLogs={handleLoadLogsPage}
            onRefreshFiltered={handleRefreshFiltered}
            onExtend={handleExtend}
            onDeactivate={openConfirm}
            onBack={() => {
                router.push("/teacher")
            }}
            realtimeLogs={realtimeLogs}
            isWsConnected={isConnected}
            isExporting={isExporting}
            onExport={handleExport}
            imageFilter={imageFilter}
            onImageFilterChange={setImageFilter}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            expiresAt={expiresAt}
            onOpenConfirm={openConfirm}
            onCloseConfirm={closeConfirm}
            onConfirmDeactivate={handleConfirmDeactivate}
            showConfirm={showConfirm}
            isExpired={isExpired}
            onExitToHome={handleExitToHome}
            showNotification={showNotification}
            notificationMessage={notificationMessage}
            dismissNotification={dismissNotification}
            onResetFilters={resetFilters}
        />
    )
}