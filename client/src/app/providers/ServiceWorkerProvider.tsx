"use client"

import { useEffect } from "react"

import { registerServiceWorker } from "@/shared/lib/pwa/registerServiceWorker"

export const ServiceWorkerProvider = () => {
	useEffect(() => {
		void registerServiceWorker()
	}, [])

	return null
}
