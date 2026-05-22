import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { http } from "@/shared/api"
import { useRoleStore } from "@/features/role-select"

interface UseJoinClassroomReturn {
    code: string
    setCode: (value: string) => void
    isLoading: boolean
    error: string | null
    handleJoin: () => Promise<void>
}

export const useJoinClassroom = (): UseJoinClassroomReturn => {
    const [code, setCode] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const router = useRouter()
    const setRole = useRoleStore((state) => state.setRole)
    const setClassroomCode = useRoleStore((state) => state.setClassroomCode)
    const setExpiresAt = useRoleStore((state) => state.setExpiresAt)

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
            const response = await http.get(`/api/classrooms/${trimmedCode}/join?student_id=1`)
            const expires = response.data.expires_at as string | undefined

            if (expires) {
                localStorage.setItem("expiresAt", expires)
                setExpiresAt(expires)
            }

            setRole("student")
            setClassroomCode(trimmedCode)
            router.push("/chat")
        } catch (err: any) {
            if (err.response?.status === 404) {
                setError("Класс не найден. Проверьте код.")
            } else if (err.response?.status === 410) {
                setError("Класс уже завершен.")
            } else {
                setError("Не удалось подключиться. Попробуйте позже.")
            }
            setIsLoading(false)
        }
    }, [code, router, setRole, setClassroomCode, setExpiresAt])

    return { code, setCode, isLoading, error, handleJoin }
}
