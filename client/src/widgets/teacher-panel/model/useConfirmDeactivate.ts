import { useCallback,useState } from "react"
import { UseConfirmDeactivateReturn } from "../types"



export const useConfirmDeactivate = (): UseConfirmDeactivateReturn => {
    const [showConfirm, setShowConfirm] = useState(false)

    const openConfirm = useCallback(() => setShowConfirm(true), []),
     closeConfirm = useCallback(() => setShowConfirm(false), [])

    return { showConfirm, openConfirm, closeConfirm }
}