import { useCallback,useState } from "react"

import { deactivateClassroom, exportLogsCsv,extendClassroom } from "@/shared/api/classroom"

interface UseClassroomActionsReturn {
    isExtending: boolean
    isDeactivating: boolean
    actionError: string | null
    isExporting: boolean
    handleExport: () => void
    handleExtend: (minutes: number) => Promise<void>
    handleDeactivate: () => Promise<void>
}

export const useClassroomActions = (code: string, onSuccess: () => void, onExtendSuccess?: (newExpiresAt: string) => void ): UseClassroomActionsReturn => {
    const [isExtending, setIsExtending] = useState(false)
    const [isDeactivating, setIsDeactivating] = useState(false)
    const [actionError, setActionError] = useState<string | null>(null)
    const [isExporting, setIsExporting] = useState(false)


    const handleExtend = useCallback(async (minutes: number) => {
        setIsExtending(true)
        setActionError(null)
        try {
            const result = await extendClassroom(code, minutes)
            if (result.new_expires_at && onExtendSuccess) {
                onExtendSuccess(result.new_expires_at)
            }
            onSuccess()
        } catch {
            setActionError("Не удалось продлить класс")
        } finally {
            setIsExtending(false)
        }
    }, [code, onSuccess, onExtendSuccess])

    const handleExport = useCallback(async () => {
        setIsExporting(true)
        try {
            const blob = await exportLogsCsv(code)
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = `logs-${code}-${Date.now()}.csv`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch {
            setActionError("Не удалось экспортировать логи")
        } finally {
            setIsExporting(false)
        }
    }, [code])

    const handleDeactivate = useCallback(async () => {
        setIsDeactivating(true)
        setActionError(null)
        try {
            await deactivateClassroom(code)
            onSuccess()
        } catch {
            setActionError("Не удалось завершить класс")
        } finally {
            setIsDeactivating(false)
        }
    }, [code, onSuccess])

    return {isExtending, isDeactivating, isExporting, actionError, handleExtend, handleDeactivate, handleExport}
}