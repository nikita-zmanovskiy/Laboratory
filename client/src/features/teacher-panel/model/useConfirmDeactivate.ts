import { useState, useCallback } from "react"

interface UseConfirmDeactivateReturn {
    showConfirm: boolean
    openConfirm: () => void
    closeConfirm: () => void
}

export const useConfirmDeactivate = (): UseConfirmDeactivateReturn => {
    const [showConfirm, setShowConfirm] = useState(false)

    const openConfirm = useCallback(() => setShowConfirm(true), [])
    const closeConfirm = useCallback(() => setShowConfirm(false), [])

    return { showConfirm, openConfirm, closeConfirm }
}