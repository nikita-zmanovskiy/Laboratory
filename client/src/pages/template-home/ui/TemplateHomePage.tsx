"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ChatMessagesContainer } from "@/features/chat-messages"
import { useChatStore } from "@/entities/chat"
import { useSessionStore } from "@/entities/session"
import { useRoleStore } from "@/features/role-select"
import { EmptyChatState } from "@/shared/ui/EmptyChatState"
import { ScreenSizeWarning } from "@/shared/ui/ScreenSizeWarningModal"
import styles from './templateHomePage.module.css'
import { LessonTimer } from "@/shared/ui/LessonTimer"
import { ChatInputContainer } from "@/features/ChatInput"
import { useClassroomSocket } from "@/features/ChatInput/model/useClassroomSocket"
import { useLessonTimer } from "@/features/teacher-panel/model/useLessonTimer"
import { ClassroomClosedModal } from "@/shared/ui/ClassroomClosedModal"
import { useLessonNotification } from "@/shared/lib/useLessonNotification"
import { NotificationToast } from "@/shared/ui/NotificationToast"
import { establishTeacherPreviewSession } from "@/shared/api/classroom"

export default function TemplateHomePage() {
    const messages = useChatStore((state) => state.messages)
    const isLoading = useChatStore((state) => state.isLoading)
    const mode = useChatStore((state) => state.mode)
    const initialize = useSessionStore((state) => state.initialize)
    const resetRole = useRoleStore((state) => state.reset)
    const exitChat = useRoleStore((state) => state.exitChat)
    const loadFromStorage = useRoleStore((state) => state.loadFromStorage)
    const classroomCode = useRoleStore((state) => state.classroomCode)
    const role = useRoleStore((state) => state.role)
    const router = useRouter()
    const sessionId = useSessionStore((state) => state.sessionId)
    const [expiresAt, setExpiresAt] = useState<string | null>(null)
    const { isClosed, closeMessage, onExtend } = useClassroomSocket(classroomCode || "")
    const { isExpired } = useLessonTimer(expiresAt)
    const { showNotification, notificationMessage, dismissNotification } = useLessonNotification(expiresAt)

    useEffect(() => {
        initialize()
        loadFromStorage()
    }, [initialize, loadFromStorage])

    useEffect(() => {
        if (role !== "teacher" || !classroomCode) return

        const stored = localStorage.getItem("currentClass")
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as { code: string; expires_at: string }
                if (parsed.code === classroomCode && parsed.expires_at) {
                    setExpiresAt(parsed.expires_at)
                }
            } catch {
                // ignore
            }
        }

        establishTeacherPreviewSession(classroomCode).catch(() => {
            // сессия учителя истекла — вернуть на панель
        })
    }, [role, classroomCode])

    useEffect(() => {
        const stored = localStorage.getItem("expiresAt")
        if (stored) setExpiresAt(stored)
    }, [])

    useEffect(() => {
        onExtend((newExpiresAt: string) => {
            setExpiresAt(newExpiresAt)
        })
    }, [onExtend])

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (messages.length > 0 || isLoading) {
                e.preventDefault()
            }
        }
        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [messages, isLoading])

    const handleExitToHome = () => {
        resetRole()
        router.push("/")
    }

    const handleExit = () => {
        if (role === "teacher") {
            let target = "/teacher"
            try {
                const stored = localStorage.getItem("currentClass")
                if (stored) {
                    const parsed = JSON.parse(stored) as { code: string; expires_at: string }
                    if (new Date(parsed.expires_at).getTime() > Date.now()) {
                        target = `/teacher/classroom/${parsed.code}`
                    }
                } else if (classroomCode) {
                    target = `/teacher/classroom/${classroomCode}`
                }
            } catch {
                if (classroomCode) {
                    target = `/teacher/classroom/${classroomCode}`
                }
            }

            router.push('/')
            setTimeout(() => {
                useChatStore.getState().clearMessages()
                useRoleStore.getState().setRole("teacher")
            }, 500)
            return
        }

        let target = "/"
        try {
            const stored = localStorage.getItem("currentClass")
            if (stored) {
                const parsed = JSON.parse(stored) as { code: string; expires_at: string }
                if (new Date(parsed.expires_at).getTime() > Date.now()) {
                    target = `/teacher/classroom/${parsed.code}`
                }
            }
        } catch {
            // ignore
        }

        router.push('/')
        setTimeout(() => {
            useChatStore.getState().clearMessages()
            if (target.startsWith("/teacher")) {
                const stored = localStorage.getItem("currentClass")
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored) as { code: string; expires_at: string }
                        useRoleStore.getState().setRole("teacher")
                        useRoleStore.getState().setClassroomCode(parsed.code)
                        useRoleStore.getState().setExpiresAt(parsed.expires_at)
                    } catch {
                        useRoleStore.getState().setRole("teacher")
                    }
                } else {
                    useRoleStore.getState().setRole("teacher")
                }
            } else {
                exitChat()
            }
        }, 500)
    }

    return (
        <main className="mx-auto flex h-screen w-full max-w-5xl flex-col overflow-hidden px-4 !pb-0">
            {showNotification && (
                <NotificationToast message={notificationMessage} onClose={dismissNotification} />
            )}
            <ScreenSizeWarning />
            <header className={`${styles.template__header} page__animation-opacity p-10 mb-4 flex items-center justify-between`}>
                <div className={`${styles.header__info} flex gap-4`}>
                    {sessionId && (
                        <span className="text-xs text-[var(--color-text-muted)] font-mono" title="ID вашей сессии">
                            {sessionId}
                        </span>
                    )}
                    {expiresAt && <LessonTimer expiresAt={expiresAt} />}
                </div>
                <button
                    onClick={handleExit}
                    className={`${styles.template__exit} cursor-pointer flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-hover)]`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Выйти
                </button>
            </header>
            <div className="mb-0 min-h-0 w-full flex-1">
                {messages.length > 0 ? (
                    <ChatMessagesContainer messages={messages} isLoading={isLoading} isTextMode={mode === "text"} />
                ) : (
                    <EmptyChatState />
                )}
            </div>
            <div className="sticky bottom-4 w-full">
                <ChatInputContainer />
            </div>
            {(isClosed || isExpired) && (
                <ClassroomClosedModal
                    message={closeMessage || "Время урока истекло"}
                    onExit={handleExitToHome}
                />
            )}
        </main>
    )
}