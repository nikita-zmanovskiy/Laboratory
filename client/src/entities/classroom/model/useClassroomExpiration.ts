import { useEffect, useState } from "react"

interface UseClassroomExpirationReturn {
    isExpired: boolean
}

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
