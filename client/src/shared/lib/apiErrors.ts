import { AxiosError } from "axios"
import { HTTP_ERROR_MAP } from "../config/apiErrors"


interface ApiErrorResponse {
	code?: string
	error?: string
	message?: string
}

export const getApiErrorMessage = (
	error: unknown,
): string => {
	if (!(error instanceof AxiosError)) {
		return "Произошла непредвиденная ошибка. Попробуйте позже."
	}
	if (
		error.code === "ERR_NETWORK" ||
		!error.response
	) {
		return "Нет подключения к сети. Проверьте интернет."
	}
	if (
		error.code === "ECONNABORTED" ||
		error.message.includes("timeout")
	) {
		return "Сервис временно недоступен. Попробуйте позже."
	}

	const status = error.response.status,
	 responseData = error.response.data as
		| ApiErrorResponse
		| undefined
	if (
		status === 400 &&
		(responseData?.code ===
			"SAFETY_VIOLATION" ||
			responseData?.error === "security")
	) {
		return "Запрос отклонён по соображениям безопасности"
	}
	if (HTTP_ERROR_MAP[status]) {
		return HTTP_ERROR_MAP[status]
	}

	return "Внутренняя ошибка сервиса. Попробуйте позже."
}
