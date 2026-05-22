import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSessionStore } from "@/entities/session"
import { useRoleStore } from "@/features/role-select"
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
        } catch (err: any) {
            setError(err.response?.data?.error || "Не удалось создать класс")
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
