import { useEffect, useRef } from "react"

export const useAutoScroll = (deps: unknown[]) => {
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const timer = setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 500)
        return () => clearTimeout(timer)
    }, deps)

    return bottomRef
}