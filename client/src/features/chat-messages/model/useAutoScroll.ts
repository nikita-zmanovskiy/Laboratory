import { useEffect, useRef } from "react"

export const useAutoScroll = (messageCount: number, isLoading: boolean) => {
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const timer = setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 500)
        return () => clearTimeout(timer)
    }, [messageCount, isLoading])

    return bottomRef
}