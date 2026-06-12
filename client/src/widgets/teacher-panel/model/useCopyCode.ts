import { useCallback,useState } from "react"

import { copyToClipboard } from "@/shared/lib/copyToClipboard"

import { UseCopyCodeReturn } from "../types"



export const useCopyCode = (code: string): UseCopyCodeReturn => {
    const [copied, setCopied] = useState(false)

    const handleCopy = useCallback(async () => {
        const success = await copyToClipboard(code)
        if (success) {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }, [code])

    return { copied, handleCopy }
}