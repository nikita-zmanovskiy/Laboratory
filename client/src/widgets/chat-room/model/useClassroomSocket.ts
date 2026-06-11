"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { getWebSocketAuthToken } from "@/entities/classroom"

import { WSTransport } from "@/shared/lib/transport/wsTransport"
import { getClassroomWebSocketUrl } from "@/shared/lib/wsUrl"
import { ClassroomSocketMessage, UseClassroomSocketReturn } from "../types"



export const useClassroomSocket = (classroomCode: string): UseClassroomSocketReturn => {
    const [isClosed, setIsClosed] = useState(false)
    const [closeMessage, setCloseMessage] = useState("")
    const transportRef = useRef<WSTransport<ClassroomSocketMessage> | null>(null)
    const extendCallbackRef = useRef<((newExpiresAt: string) => void) | null>(null)

    const onExtend = useCallback((callback: (newExpiresAt: string) => void) => {
        extendCallbackRef.current = callback
    }, [])

    const createSocketUrl = useCallback(async () => {
        const { token } = await getWebSocketAuthToken(classroomCode)
        return getClassroomWebSocketUrl(classroomCode, token)
    }, [classroomCode])

    const handleMessage = useCallback((data: ClassroomSocketMessage) => {
        if (data.type === "classroom_closed") {
            setIsClosed(true)
            setCloseMessage(data.message || "Урок завершен")
        }

        if (data.type === "classroom_extended" && data.new_expires_at) {
            localStorage.setItem("expiresAt", data.new_expires_at)
            extendCallbackRef.current?.(data.new_expires_at)
        }
    }, [])

    useEffect(() => {
        if (!classroomCode) {
            return
        }

        const transport = new WSTransport<ClassroomSocketMessage>({
            getUrl: createSocketUrl,
            onMessage: handleMessage,
            reconnectDelay: 5000,
        })

        transportRef.current = transport
        void transport.connect()

        return () => {
            transport.close("unmount")
            transportRef.current = null
        }
    }, [classroomCode, createSocketUrl, handleMessage])

    return { isClosed, closeMessage, onExtend }
}
