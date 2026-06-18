import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { AxiosError } from "axios"

import { createClassroom, setCurrentClassToStorage } from "@/entities/classroom"
import { useRoleStore, useSessionStore } from "@/entities/session"

import { DURATION_OPTIONS } from "@/shared/config/classroom"
import { appRoutes } from "@/shared/config/router/routes"



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

/**
 * Хук для создания класса учителем
 *
 * Валидирует наличие названия и sessionId
 * Вызывает createClassroom из entities/classroom
 * При успехе сохраняет expiresAt в localStorage и currentClassStorage,
 * устанавливает роль teacher и перенаправляет на страницу класса
 * При ошибке извлекает сообщение из ответа сервера или показывает fallback
 *
 * @returns title - название класса
 * @returns setTitle - функция установки названия
 * @returns grade - номер класса
 * @returns setGrade - функция установки номера класса
 * @returns duration - длительность урока в минутах
 * @returns setDuration - функция установки длительности
 * @returns isLoading - флаг выполнения запроса
 * @returns error - текст ошибки или null
 * @returns durationOptions - массив опций длительности урока
 * @returns handleCreate - функция создания класса
 */

export const useCreateClassroom = (): UseCreateClassroomReturn => {
    const [title, setTitle] = useState(""),
     [grade, setGrade] = useState(7),
     [duration, setDuration] = useState(45),
     [isLoading, setIsLoading] = useState(false),
     [error, setError] = useState<string | null>(null)

    const sessionId = useSessionStore((state) => state.sessionId),
     setRole = useRoleStore((state) => state.setRole),
     setClassroomCode = useRoleStore((state) => state.setClassroomCode),
     setExpiresAt = useRoleStore((state) => state.setExpiresAt)
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
