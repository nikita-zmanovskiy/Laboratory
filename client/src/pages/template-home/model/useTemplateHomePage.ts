"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { useClassroomSocket } from "@/widgets/chat-room"

import { useChatStore } from "@/entities/chat"
import {
    establishTeacherPreviewSession,
    getCurrentClassFromStorage,
    isClassroomActive,
    useClassroomExpiration,
} from "@/entities/classroom"
import { useRoleStore, useSessionStore } from "@/entities/session"

import { appRoutes } from "@/shared/config/routes"
import { useLessonNotification } from "@/shared/lib/useLessonNotification"

import { useBeforeUnloadWarning } from "./useBeforeUnloadWarning"

export const useTemplateHomePage = () => {
    const router = useRouter()

    const messages = useChatStore((state) => state.messages),
     isLoading = useChatStore((state) => state.isLoading),
     clearMessages = useChatStore((state) => state.clearMessages)

    const sessionId = useSessionStore((state) => state.sessionId),
     initialize = useSessionStore((state) => state.initialize)

    const role = useRoleStore((state) => state.role),
     classroomCode = useRoleStore((state) => state.classroomCode),
     resetRole = useRoleStore((state) => state.reset)

    const exitChat = useRoleStore((state) => state.exitChat),
     loadFromStorage = useRoleStore((state) => state.loadFromStorage),
     setRole = useRoleStore((state) => state.setRole)


    const setClassroomCode = useRoleStore((state) => state.setClassroomCode),
     setExpiresAtStore = useRoleStore((state) => state.setExpiresAt)

    const [expiresAt, setExpiresAt] = useState<string | null>(null)
    
    const { isClosed, closeMessage, onExtend } = useClassroomSocket(
        classroomCode || "",
    )

    const { isExpired } = useClassroomExpiration(expiresAt)

    const {
        showNotification,
        notificationMessage,
        dismissNotification,
    } = useLessonNotification(expiresAt)

    useEffect(() => {
        initialize()
        loadFromStorage()
    }, [initialize, loadFromStorage])

    useEffect(() => {
        const storedExpiresAt = localStorage.getItem("expiresAt")

        if (storedExpiresAt) {
            setExpiresAt(storedExpiresAt)
        }
    }, [])

    useEffect(() => {
        if (role !== "teacher" || !classroomCode) {
            return
        }

        const currentClass = getCurrentClassFromStorage()

        if (
            currentClass &&
            currentClass.code === classroomCode &&
            currentClass.expires_at
        ) {
            setExpiresAt(currentClass.expires_at)
        }

        establishTeacherPreviewSession(classroomCode).catch(() => {
            // Сессия учителя истекла
        })
    }, [role, classroomCode])

    useEffect(() => {
        onExtend((newExpiresAt: string) => {
            setExpiresAt(newExpiresAt)
        })
    }, [onExtend])

    useBeforeUnloadWarning({
        enabled: messages.length > 0 || isLoading,
    })

    const handleExitToHome = () => {
        resetRole()
        router.push(appRoutes.home)
    }

    const restoreTeacherRoleFromStorage = () => {
        const currentClass = getCurrentClassFromStorage()

        setRole("teacher")

        if (!currentClass) {
            return
        }

        setClassroomCode(currentClass.code)
        setExpiresAtStore(currentClass.expires_at)
    }

    const handleExit = () => {
        clearMessages()

        if (role === "teacher") {
            setRole("teacher")
            router.push(appRoutes.home)

            return
        }

        const currentClass = getCurrentClassFromStorage()

        if (currentClass && isClassroomActive(currentClass.expires_at)) {
            restoreTeacherRoleFromStorage()
            router.push(appRoutes.teacherClassroom(currentClass.code))

            return
        }

        exitChat()
        router.push(appRoutes.home)
    }

    return {
        sessionId,
        expiresAt,
        showNotification,
        notificationMessage,
        dismissNotification,
        isClosed,
        isExpired,
        closeMessage,
        handleExit,
        handleExitToHome,
    }
}
