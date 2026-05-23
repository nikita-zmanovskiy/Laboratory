import { AxiosError } from "axios"

import { getApiErrorMessage } from "@/shared"

export interface SendMessageErrorResult {
    assistantText: string
    shouldRollback: boolean
    errorMessage: string | null
}

export const mapSendMessageError = (error: unknown): SendMessageErrorResult => {
    const message = getApiErrorMessage(error)
    const isSecurityError = error instanceof AxiosError && error.response?.status === 403

    return {
        assistantText: isSecurityError
            ? "Запрос отклонён по соображениям безопасности"
            : "Ошибка запроса",
        shouldRollback: !isSecurityError,
        errorMessage: isSecurityError ? null : message,
    }
}
