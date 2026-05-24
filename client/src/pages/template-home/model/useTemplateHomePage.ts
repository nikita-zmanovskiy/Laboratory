"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { useChatStore } from "@/entities/chat"
import { useSessionStore } from "@/entities/session"
import { useRoleStore } from "@/features/role-select"
import { useLessonTimer } from "@/features/teacher-panel/model/useLessonTimer"
import { establishTeacherPreviewSession } from "@/shared/api/classroom"
import { useLessonNotification } from "@/shared/lib/useLessonNotification"
import { useClassroomSocket } from "@/widgets/chat-room"

import {
  getCurrentClassFromStorage,
  isClassroomActive,
} from "../lib/currentClassStorage"
import { useBeforeUnloadWarning } from "./useBeforeUnloadWarning"

export const useTemplateHomePage = () => {
  const router = useRouter();

  const messages = useChatStore((state) => state.messages),
   isLoading = useChatStore((state) => state.isLoading),
   clearMessages = useChatStore((state) => state.clearMessages)

  const sessionId = useSessionStore((state) => state.sessionId),
   initialize = useSessionStore((state) => state.initialize)

  const role = useRoleStore((state) => state.role),
   classroomCode = useRoleStore((state) => state.classroomCode),
   resetRole = useRoleStore((state) => state.reset),
   exitChat = useRoleStore((state) => state.exitChat),
   loadFromStorage = useRoleStore((state) => state.loadFromStorage),
   setRole = useRoleStore((state) => state.setRole),
   setClassroomCode = useRoleStore((state) => state.setClassroomCode),
   setExpiresAtStore = useRoleStore((state) => state.setExpiresAt)

  const [expiresAt, setExpiresAt] = useState<string | null>(null)

  const { isClosed, closeMessage, onExtend } = useClassroomSocket(
    classroomCode || "",
  )

  const { isExpired } = useLessonTimer(expiresAt)

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
      setExpiresAt(newExpiresAt);
    });
  }, [onExtend])

  useBeforeUnloadWarning({
    enabled: messages.length > 0 || isLoading,
  })

  const handleExitToHome = () => {
    resetRole()
    router.push("/")
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
      router.push("/")

      return
    }

    const currentClass = getCurrentClassFromStorage()

    if (currentClass && isClassroomActive(currentClass.expires_at)) {
      restoreTeacherRoleFromStorage()
      router.push(`/teacher/classroom/${currentClass.code}`)

      return
    }

    exitChat()
    router.push("/")
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