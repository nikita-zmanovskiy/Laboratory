import { useCallback, useEffect, useRef, useState } from "react"

import { getWebSocketAuthToken } from "@/shared/api"
import { closeWebSocket } from "@/shared/lib/closeWebSocket"
import { getClassroomWebSocketUrl } from "@/shared/lib/wsUrl"

export interface LogEntry {
    id: number
    timestamp: string
    session_id: string
    mode: string
    prompt_hash: string
    image_attached: boolean
    tokens_input: number
    tokens_output: number
    status: number
    response_time_ms: number
    error_message: string | null
}

interface UseWebSocketLogsReturn {
    realtimeLogs: LogEntry[]
    isConnected: boolean
    onNewLog: (callback: () => void) => void
}

export const useWebSocketLogs = (classroomCode: string): UseWebSocketLogsReturn => {
    const [realtimeLogs, setRealtimeLogs] = useState<LogEntry[]>([]),
     [isConnected, setIsConnected] = useState(false),
     wsRef = useRef<WebSocket | null>(null),
     callbackRef = useRef<(() => void) | null>(null),
     connectingRef = useRef(false)

    const onNewLog = useCallback((callback: () => void) => {
        callbackRef.current = callback
    }, [])

    const connect = useCallback(async () => {
        if (wsRef.current?.readyState === WebSocket.OPEN || connectingRef.current) return

        connectingRef.current = true
        setIsConnected(false)

        try {
            const { token } = await getWebSocketAuthToken(classroomCode),
             ws = new WebSocket(getClassroomWebSocketUrl(classroomCode, token))

            ws.onopen = () => {
                setIsConnected(true)
            }

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)
                    if (data.type === "new_log" && data.log) {
                        setRealtimeLogs((prev) => {
                            const exists = prev.some((l) => l.id === data.log.id)
                            if (exists) return prev
                            return [data.log, ...prev].slice(0, 5)
                        })
                        callbackRef.current?.()
                    }
                } catch {
                    // ignore malformed messages
                }
            }

            ws.onclose = (event) => {
                setIsConnected(false)
                wsRef.current = null
                if (event.code !== 1000) {
                    setTimeout(() => void connect(), 5000)
                }
            }

            ws.onerror = () => {
                setIsConnected(false)
            }

            wsRef.current = ws
        } catch {
            setIsConnected(false)
            setTimeout(() => void connect(), 5000)
        } finally {
            connectingRef.current = false
        }
    }, [classroomCode])

    useEffect(() => {
        void connect()
        return () => {
            if (wsRef.current) {
                closeWebSocket(wsRef.current)
                wsRef.current = null
            }
        }
    }, [connect])

    return { realtimeLogs, isConnected, onNewLog }
}
