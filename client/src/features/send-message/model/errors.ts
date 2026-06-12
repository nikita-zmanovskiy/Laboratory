import { AxiosError } from "axios"

import { getApiErrorMessage } from "@/shared/lib/apiErrors"

export interface SendMessageErrorResult {
    assistantText: string
    shouldRollback: boolean
    errorMessage: string | null
}
/**
 * Преобразует ошибку отправки сообщения в результат для UI
 *
 * Для ошибок безопасности (403) возвращает специальный текст ассистента
 * и не удаляет оптимистичные сообщения (shouldRollback = false)
 * Для остальных ошибок удаляет сообщения и возвращает текст ошибки
 *
 * @param error - ошибка из catch блока (ожидается AxiosError)
 * @returns assistantText - текст для сообщения ассистента
 * @returns shouldRollback - флаг необходимости удалить оптимистичные сообщения
 * @returns errorMessage - текст ошибки для отображения или null
 */

export const mapSendMessageError = (error: unknown): SendMessageErrorResult => {
    const message = getApiErrorMessage(error),
     isSecurityError = error instanceof AxiosError && error.response?.status === 403

    return {
        assistantText: isSecurityError
            ? "Запрос отклонён по соображениям безопасности"
            : "Ошибка запроса",
        shouldRollback: !isSecurityError,
        errorMessage: isSecurityError ? null : message,
    }
}
