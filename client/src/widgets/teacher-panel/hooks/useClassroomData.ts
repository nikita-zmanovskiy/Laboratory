import { useCallback, useEffect, useRef, useState } from "react"

import {
	type ClassroomLog,
	type ClassroomStats,
	fetchClassroomLogs,
	getClassroomStats,
	type LogFilters,
} from "@/entities/classroom"

import { UseClassroomDataReturn } from "../types"



const isCanceledRequest = (error: unknown): boolean => {
	if (!error || typeof error !== "object") {
		return false
	}

	const maybeError = error as {
		code?: string
		name?: string
	}

	return maybeError.code === "ERR_CANCELED" || maybeError.name === "CanceledError"
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
	 [error, setError] = useState<string | null>(null)

	const hasLoadedOnceRef = useRef(false),
	 logsAbortControllerRef = useRef<AbortController | null>(null),
	 logsRequestIdRef = useRef(0),
	 statsRequestIdRef = useRef(0),
	 lastLogsFiltersRef = useRef<LogFilters | undefined>(undefined),
	 lastLogsPageRef = useRef(1)

	const loadLogs = useCallback(
		(page: number, filters?: LogFilters) => {
			logsAbortControllerRef.current?.abort()

			const controller = new AbortController(),
			 requestId = logsRequestIdRef.current + 1

			logsAbortControllerRef.current = controller
			logsRequestIdRef.current = requestId
			lastLogsPageRef.current = page
			lastLogsFiltersRef.current = filters

			if (hasLoadedOnceRef.current) {
				setIsRefreshing(true)
			} else {
				setIsInitialLoading(true)
			}

			setError(null)

			void fetchClassroomLogs(code, page, 10, filters, {
				signal: controller.signal,
			})
				.then((data) => {
					if (controller.signal.aborted) {
						return
					}

					if (logsRequestIdRef.current !== requestId) {
						return
					}

					setLogs(data.logs)
					setLogsPage(data.page)
					setLogsTotal(data.total)
					setLogsTotalPages(data.total_pages)
					hasLoadedOnceRef.current = true
				})
				.catch((error) => {
					if (controller.signal.aborted || isCanceledRequest(error)) {
						return
					}

					if (logsRequestIdRef.current !== requestId) {
						return
					}

					setError("Не удалось загрузить логи")
				})
				.finally(() => {
					if (controller.signal.aborted) {
						return
					}

					if (logsRequestIdRef.current !== requestId) {
						return
					}

					setIsInitialLoading(false)
					setIsRefreshing(false)
				})
		},
		[code]
	)

	const loadStats = useCallback(async () => {
		const requestId = statsRequestIdRef.current + 1

		statsRequestIdRef.current = requestId

		try {
			const data = await getClassroomStats(code)

			if (statsRequestIdRef.current !== requestId) {
				return
			}

			setStats(data.stats)

			if (data.expires_at) {
				setExpiresAt(data.expires_at)
			}
		} catch {
			return
		}
	}, [code])

	const refreshStatsOnly = useCallback(() => {
		void loadStats()
	}, [loadStats])

	const refreshAll = useCallback(() => {
		setError(null)
		loadLogs(lastLogsPageRef.current, lastLogsFiltersRef.current)
		void loadStats()
	}, [loadLogs, loadStats])

	useEffect(() => {
		hasLoadedOnceRef.current = false
		logsRequestIdRef.current += 1
		statsRequestIdRef.current += 1
		logsAbortControllerRef.current?.abort()
		logsAbortControllerRef.current = null
		lastLogsPageRef.current = 1
		lastLogsFiltersRef.current = undefined

		setLogs([])
		setStats(null)
		setExpiresAt(null)
		setError(null)
		setLogsPage(1)
		setLogsTotal(0)
		setLogsTotalPages(0)
		setIsInitialLoading(true)
		setIsRefreshing(false)

		loadLogs(1)
		void loadStats()
	}, [code, loadLogs, loadStats])

	useEffect(() => {
		return () => {
			logsAbortControllerRef.current?.abort()
			logsRequestIdRef.current += 1
			statsRequestIdRef.current += 1
		}
	}, [])

	return {
		logs,
		stats,
		expiresAt,
		logsPage,
		logsTotal,
		logsTotalPages,
		isInitialLoading,
		isRefreshing,
		error,
		loadLogs,
		refreshAll,
		refreshStatsOnly,
	}
}
