"use client"

import { useCallback, useEffect, useMemo, useRef,useState } from "react"
import { useRouter } from "next/navigation"

import { updateCurrentClassExpiresAt, useClassroomExpiration } from "@/entities/classroom"
import { useRoleStore } from "@/entities/session"

import { appRoutes } from "@/shared/config/router/routes"
import { useLessonNotification } from "@/shared/lib/useLessonNotification"

import { buildLogFilters, hasActiveLogFilters } from "../model/logFilters"
import { useClassroomActions } from "../model/useClassroomActions"
import { useClassroomData } from "../model/useClassroomData"
import { useConfirmDeactivate } from "../model/useConfirmDeactivate"
import { useWebSocketLogs } from "../model/useWebSocketLogs"

import { TeacherPanel } from "./TeacherPanel"

export const TeacherPanelContainer = ({ code }: { code: string }) => {
    const router = useRouter()

    const { logs, stats, logsPage, logsTotal, logsTotalPages, isInitialLoading, isRefreshing, loadLogs, refreshAll, refreshStatsOnly } = useClassroomData(code),
     { isExtending, isDeactivating, actionError, handleExtend, handleExport, isExporting, handleDeactivate } = useClassroomActions(
        code, 
        refreshAll,
        (newExpiresAt) => {
            setExpiresAt(newExpiresAt)
            localStorage.setItem("expiresAt", newExpiresAt)
            updateCurrentClassExpiresAt(newExpiresAt)
        }
    )
    const { realtimeLogs, isConnected, onNewLog } = useWebSocketLogs(code),
     { showConfirm, openConfirm, closeConfirm } = useConfirmDeactivate(),
     resetRole = useRoleStore((state) => state.reset)

    const [expiresAt, setExpiresAt] = useState<string | null>(null),
     [searchQuery, setSearchQuery] = useState(""),
     [modeFilter, setModeFilter] = useState("all"),
     [statusFilter, setStatusFilter] = useState("all"),
     [imageFilter, setImageFilter] = useState("all"),
     [sortOrder, setSortOrder] = useState("newest"),
     [filtersClosing, setFiltersClosing] = useState(false),
     skipFilterFetchOnMount = useRef(true)

    const hasActiveFilters = useMemo(
        () => hasActiveLogFilters(searchQuery, modeFilter, statusFilter, imageFilter),
        [searchQuery, modeFilter, statusFilter, imageFilter]
    )

    const getFilters = useCallback(
        () => buildLogFilters(searchQuery, modeFilter, statusFilter, imageFilter, sortOrder),
        [searchQuery, modeFilter, statusFilter, imageFilter, sortOrder]
    )

    const role = useRoleStore((state) => state.role),
     setRole = useRoleStore((state) => state.setRole)
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

        const delay = searchQuery.trim() ? 350 : 0,
         timer = setTimeout(() => {
            loadLogs(1, getFilters())
        }, delay)

        return () => clearTimeout(timer)
    }, [searchQuery, modeFilter, statusFilter, imageFilter, sortOrder, loadLogs, getFilters, hasActiveFilters, filtersClosing])

    const { isExpired } = useClassroomExpiration(expiresAt),
     { showNotification, notificationMessage, dismissNotification } = useLessonNotification(expiresAt),
     handleRefreshFiltered = () => {
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
        router.push(appRoutes.home)
    }

    const handleExitToHome = () => {
        resetRole()
        router.push(appRoutes.home)
    }

    useEffect(() => {
        if (!role) {
            setRole("teacher")
        } else if (role !== "teacher") {
            router.push(appRoutes.home)
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
            stats={stats}
            logsPage={logsPage}
            logsTotal={logsTotal}
            logsTotalPages={logsTotalPages}
            isInitialLoading={isInitialLoading}
            isRefreshing={isRefreshing}
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
            onBack={() => {
                router.push(appRoutes.teacher)
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
