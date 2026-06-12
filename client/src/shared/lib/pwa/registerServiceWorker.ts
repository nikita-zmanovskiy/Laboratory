import { PWA_CONFIG } from "../../config/pwa"

/**
 * Регистрирует Service Worker для PWA
 *
 * Работает только в production окружении и при поддержке Service Worker браузером
 * При обнаружении обновления отправляет сообщение SKIP_WAITING новому воркеру
 * для немедленной активации без ожидания закрытия вкладок
 * После активации нового воркера перезагружает страницу
 */

const isServiceWorkerSupported = (): boolean => {
	return typeof window !== "undefined" && "serviceWorker" in navigator
}

export const registerServiceWorker = async (): Promise<void> => {
	if (process.env.NODE_ENV !== "production" || !isServiceWorkerSupported()) {
		return
	}

	try {
		const registration = await navigator.serviceWorker.register(
			PWA_CONFIG.SERVICE_WORKER_PATH,
			{ scope: "/" },
		)

		registration.addEventListener("updatefound", () => {
			const installingWorker = registration.installing

			if (!installingWorker) {
				return
			}

			installingWorker.addEventListener("statechange", () => {
				if (
					installingWorker.state === "installed" &&
					navigator.serviceWorker.controller
				) {
					installingWorker.postMessage({ type: "SKIP_WAITING" })
				}
			})
		})

		navigator.serviceWorker.addEventListener("controllerchange", () => {
			window.location.reload()
		})
	} catch (error) {
		console.error("Service worker registration failed:", error)
	}
}
