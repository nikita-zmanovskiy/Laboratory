"use client"

import { useCallback } from "react"

import { OFFLINE_PAGE_CONTENT } from "@/shared/config/pwa"

export const OfflinePage = () => {
	const handleRetry = useCallback(() => {
		window.location.reload()
	}, [])

	return (
		<main className="flex min-h-screen items-center justify-center bg-[var(--color-bg-primary)] px-4">
			<div className="page__animation flex max-w-md flex-col items-center text-center">
				<div
					className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)]"
					aria-hidden="true"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="h-8 w-8 text-[var(--color-text-muted)]"
					>
						<line x1="1" y1="1" x2="23" y2="23" />
						<path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
						<path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
						<path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
						<path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
						<path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
						<line x1="12" y1="20" x2="12.01" y2="20" />
					</svg>
				</div>

				<h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
					{OFFLINE_PAGE_CONTENT.title}
				</h1>

				<p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
					{OFFLINE_PAGE_CONTENT.description}
				</p>

				<button
					type="button"
					onClick={handleRetry}
					className="mt-8 cursor-pointer rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
				>
					{OFFLINE_PAGE_CONTENT.retryLabel}
				</button>
			</div>
		</main>
	)
}
