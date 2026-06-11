import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { AxiosError } from "axios"

import { createClassroom, setCurrentClassToStorage } from "@/entities/classroom"
import { useRoleStore, useSessionStore } from "@/entities/session"

import { appRoutes } from "@/shared/config/routes"
import { DURATION_OPTIONS } from "@/shared/config/classroom"



interface UseCreateClassroomData {
    title: string
    grade: number
    duration: number
    isLoading: boolean
    error: string | null
    durationOptions: typeof DURATION_OPTIONS
}

interface UseCreateClassroomHandlers {
    setTitle: (value: string) => void
    setGrade: (value: number) => void
    setDuration: (value: number) => void
    handleCreate: () => Promise<void>
}

type UseCreateClassroomReturn = UseCreateClassroomData & UseCreateClassroomHandlers

export const useCreateClassroom = (): UseCreateClassroomReturn => {
    const [title, setTitle] = useState("")
    const [grade, setGrade] = useState(7)
    const [duration, setDuration] = useState(45)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const sessionId = useSessionStore((state) => state.sessionId)
    const setRole = useRoleStore((state) => state.setRole)
    const setClassroomCode = useRoleStore((state) => state.setClassroomCode)
    const setExpiresAt = useRoleStore((state) => state.setExpiresAt)
    const router = useRouter()

    const handleCreate = useCallback(async () => {
        if (!title.trim()) {
            setError("Введите название класса")
            return
        }

        if (!sessionId) {
            setError("Ошибка сессии. Обновите страницу.")
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const classroom = await createClassroom(title.trim(), grade, duration, sessionId)

            localStorage.setItem("expiresAt", classroom.expires_at)
            setCurrentClassToStorage({
                code: classroom.code,
                title: title.trim(),
                expires_at: classroom.expires_at,
            })
            setRole("teacher")
            setClassroomCode(classroom.code)
            setExpiresAt(classroom.expires_at)
            router.push(appRoutes.teacherClassroom(classroom.code))
        } catch (err: unknown) {
            const message = err instanceof AxiosError
                ? err.response?.data?.error
                : null
            setError(message || "Не удалось создать класс")
            setIsLoading(false)
        }
    }, [title, grade, duration, sessionId, router, setRole, setClassroomCode, setExpiresAt])

    return {
        title,
        setTitle,
        grade,
        setGrade,
        duration,
        setDuration,
        isLoading,
        error,
        durationOptions: DURATION_OPTIONS,
        handleCreate,
    }
}
