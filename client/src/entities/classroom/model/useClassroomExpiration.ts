import { useEffect, useState } from "react"

interface UseClassroomExpirationReturn {
    isExpired: boolean
}
/**
 * Хук для отслеживания истечения срока действия класса
 *
 * Сравнивает expiresAt с текущим временем каждую секунду
 * Если expiresAt отсутствует - сбрасывает флаг в false
 * При размонтировании очищает интервал проверки
 *
 * @param expiresAt - дата истечения в ISO формате или null
 * @returns isExpired - true если срок действия истёк
 */

export const useClassroomExpiration = (
    expiresAt: string | null
): UseClassroomExpirationReturn => {
    const [isExpired, setIsExpired] = useState(false)

    useEffect(() => {
        if (!expiresAt) {
            setIsExpired(false)
            return
        }

        const checkExpiration = () => {
            setIsExpired(new Date(expiresAt).getTime() <= Date.now())
        }

        checkExpiration()

        const intervalId = setInterval(checkExpiration, 1000)

        return () => {
            clearInterval(intervalId)
        }
    }, [expiresAt])

    return { isExpired }
}
