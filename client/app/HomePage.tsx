"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { RoleSelectPage } from "@/features/role-select"
import { useChatStore } from "@/entities/chat"

export const HomePage = () => {
    const clearMessages = useChatStore((state) => state.clearMessages)
    const [pageKey, setPageKey] = useState(0)
    const pathname = usePathname()

    useEffect(() => {
        clearMessages()
        setPageKey(prev => prev + 1)
    }, [pathname, clearMessages])

    return <RoleSelectPage key={pageKey} />
}