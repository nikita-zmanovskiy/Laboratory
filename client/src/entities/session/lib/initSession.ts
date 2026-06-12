/**
 * Инициализирует или получает существующий идентификатор сессии чата
 *
 * Пытается прочитать chat_session_id из localStorage
 * Если не найден - генерирует новый через crypto.randomUUID
 * с fallback на ручную генерацию UUID v4 для старых браузеров
 * Сохраняет сгенерированный id в localStorage
 * На сервере (typeof window === "undefined") возвращает пустую строку
 *
 * @returns строка с идентификатором сессии или пустая строка на сервере
 */

export const initSession = (): string => {
	if (typeof window === "undefined") return ""

	let storedId = localStorage.getItem(
		"chat_session_id",
	)

	if (!storedId) {
		storedId =
			crypto.randomUUID?.() ||
			"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
				/[xy]/g,
				(c) => {
					const r = (Math.random() * 16) | 0;
					return (
						c === "x" ? r : (r & 0x3) | 0x8
					).toString(16);
				},
			)

		localStorage.setItem(
			"chat_session_id",
			storedId,
		)
	}

	return storedId
}
