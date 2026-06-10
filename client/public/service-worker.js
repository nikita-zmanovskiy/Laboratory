const CACHE_NAME = "offline-cache-v1"
const OFFLINE_URL = "/offline.html"

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL)),
	)

	self.skipWaiting()
})

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) =>
				Promise.all(
					cacheNames
						.filter((name) => name !== CACHE_NAME)
						.map((name) => caches.delete(name)),
				),
			)
			.then(() => self.clients.claim()),
	)
})

self.addEventListener("message", (event) => {
	if (event.data?.type === "SKIP_WAITING") {
		self.skipWaiting()
	}
})

self.addEventListener("fetch", (event) => {
	if (event.request.method !== "GET") {
		return
	}

	if (event.request.mode === "navigate") {
		event.respondWith(
			fetch(event.request).catch(async () => {
				const cache = await caches.open(CACHE_NAME)
				const cachedResponse = await cache.match(OFFLINE_URL)

				return (
					cachedResponse ??
					new Response("Offline", {
						status: 503,
						statusText: "Service Unavailable",
					})
				)
			}),
		)

		return
	}

	event.respondWith(
		fetch(event.request).catch(
			() =>
				new Response("", {
					status: 503,
					statusText: "Service Unavailable",
				}),
		),
	)
})
