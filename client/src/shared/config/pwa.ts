export const PWA_CONFIG = {
	SERVICE_WORKER_PATH: "/service-worker.js",
	OFFLINE_PAGE_PATH: "/offline.html",
	CACHE_NAME: "offline-cache-v1",
} as const

export const OFFLINE_PAGE_CONTENT = {
	title: "Нет подключения к интернету",
	description: "Проверьте соединение и попробуйте снова. Приложение работает только при активном подключении к сети.",
	retryLabel: "Повторить",
} as const
