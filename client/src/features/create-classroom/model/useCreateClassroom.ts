import { useCallback,useState } from "react"
import { useRouter } from "next/navigation"
import { AxiosError } from "axios"

import { useRoleStore } from "@/features/role-select"

import { useSessionStore } from "@/entities/session"

import { createClassroom } from "@/shared/api/classroom"

const DURATION_OPTIONS = [
    { label: "тест 7 минут", value: 7 },
    { label: "45 минут (1 урок)", value: 45 },
    { label: "90 минут (2 урока)", value: 90 },
    { label: "2 часа", value: 120 },
    { label: "3 часа", value: 180 },
    { label: "6 часов", value: 360 },
    { label: "12 часов", value: 720 },
]

interface UseCreateClassroomReturn {
    title: string
    setTitle: (value: string) => void
    grade: number
    setGrade: (value: number) => void
    duration: number
    setDuration: (value: number) => void
    isLoading: boolean
    error: string | null
    durationOptions: typeof DURATION_OPTIONS
    handleCreate: () => Promise<void>
}

export const useCreateClassroom = (): UseCreateClassroomReturn => {
    const [title, setTitle] = useState(""),
     [grade, setGrade] = useState(7),
     [duration, setDuration] = useState(45),
     [isLoading, setIsLoading] = useState(false),
     [error, setError] = useState<string | null>(null)

    const sessionId = useSessionStore((state) => state.sessionId),
     setRole = useRoleStore((state) => state.setRole),
     setClassroomCode = useRoleStore((state) => state.setClassroomCode),
     setExpiresAt = useRoleStore((state) => state.setExpiresAt),
     router = useRouter()

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
            const currentClass = {
                code: classroom.code,
                title: title.trim(),
                expires_at: classroom.expires_at,
            }
            localStorage.setItem("currentClass", JSON.stringify(currentClass))
            setRole("teacher")
            setClassroomCode(classroom.code)
            setExpiresAt(classroom.expires_at)
            router.push(`/teacher/classroom/${classroom.code}`)
        } catch (err: unknown) {
            const message = err instanceof AxiosError
                ? err.response?.data?.error
                : null
            setError(message || "Не удалось создать класс")
            setIsLoading(false)
        }
    }, [title, grade, duration, sessionId, router, setRole, setClassroomCode, setExpiresAt])

    return {
        title, setTitle,
        grade, setGrade,
        duration, setDuration,
        isLoading, error,
        durationOptions: DURATION_OPTIONS,
        handleCreate,
    }
}
