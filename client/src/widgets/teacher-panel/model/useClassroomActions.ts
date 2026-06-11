import { useCallback,useState } from "react"

import { deactivateClassroom, exportLogsCsv, extendClassroom } from "@/entities/classroom"
import { UseClassroomActionsReturn } from "../types"


export const useClassroomActions = (code: string, onSuccess: () => void, onExtendSuccess?: (newExpiresAt: string) => void ): UseClassroomActionsReturn => {
    const [isExtending, setIsExtending] = useState(false),
     [isDeactivating, setIsDeactivating] = useState(false),
     [actionError, setActionError] = useState<string | null>(null),
     [isExporting, setIsExporting] = useState(false)


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
