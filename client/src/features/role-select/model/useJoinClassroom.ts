import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { AxiosError } from "axios"

import { joinClassroom } from "@/entities/classroom"
import { useRoleStore } from "@/entities/session"

import { appRoutes } from "@/shared/config/routes"

interface UseJoinClassroomData {
    code: string
    isLoading: boolean
    error: string | null
}

interface UseJoinClassroomHandlers {
    setCode: (value: string) => void
    handleJoin: () => Promise<void>
}

type UseJoinClassroomReturn = UseJoinClassroomData & UseJoinClassroomHandlers

/**
 * Хук для присоединения к классу по коду
 *
 * Валидирует код (ровно 6 символов, только заглавные буквы и цифры)
 * Вызывает joinClassroom из entities/classroom для проверки кода на сервере
 * При успехе сохраняет expiresAt в localStorage, устанавливает роль student
 * и перенаправляет в чат
 * Обрабатывает ошибки: 404 (класс не найден), 410 (класс завершён), остальные
 *
 * @returns code - текущее значение кода
 * @returns setCode - функция установки кода
 * @returns isLoading - флаг выполнения запроса
 * @returns error - текст ошибки или null
 * @returns handleJoin - функция отправки кода и присоединения к классу
 */

export const useJoinClassroom = (): UseJoinClassroomReturn => {
    const [code, setCode] = useState(""),
     [isLoading, setIsLoading] = useState(false),
     [error, setError] = useState<string | null>(null)

    const router = useRouter()


    const setRole = useRoleStore((state) => state.setRole),
     setClassroomCode = useRoleStore((state) => state.setClassroomCode),
     setExpiresAt = useRoleStore((state) => state.setExpiresAt)

    const handleJoin = useCallback(async () => {
        const trimmedCode = code.trim().toUpperCase()

        if (trimmedCode.length !== 6) {
            setError("Код класса должен состоять из 6 символов")
            return
        }

        if (!/^[A-Z0-9]{6}$/.test(trimmedCode)) {
            setError("Некорректный формат кода")
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const joinedClassroom = await joinClassroom(trimmedCode),
             expires = joinedClassroom.expires_at

            if (expires) {
                localStorage.setItem("expiresAt", expires)
                setExpiresAt(expires)
            }

            setRole("student")
            setClassroomCode(trimmedCode)
            router.push(appRoutes.chat)
        } catch (err: unknown) {
            const status = err instanceof AxiosError ? err.response?.status : undefined

            if (status === 404) {
                setError("Класс не найден. Проверьте код.")
            } else if (status === 410) {
                setError("Класс уже завершен.")
            } else {
                setError("Не удалось подключиться. Попробуйте позже.")
            }

            setIsLoading(false)
        }
    }, [code, router, setRole, setClassroomCode, setExpiresAt])

    return { code, setCode, isLoading, error, handleJoin }
}
