import type { Metadata } from "next"

import { OfflinePage } from "@/pages/offline"

export const metadata: Metadata = {
	title: "Нет подключения | Лаборатория ИИ",
	robots: { index: false, follow: false },
}

export default function Page() {
	return <OfflinePage />
}
