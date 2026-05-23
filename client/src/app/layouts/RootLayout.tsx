import type { Metadata } from "next"
import { Roboto } from "next/font/google"

import { PageLoader } from "@/shared/ui/PageLoader"

import { AuthGuard } from "./AuthGuard"

import "./globals.css"

const roboto = Roboto({
    subsets: ["latin", "cyrillic"],
    weight: ["400", "500", "600", "700"],
    display: "swap",
})

export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
}

export const metadata: Metadata = {
    title: "Промт-инженер | Лаборатория ИИ",
    description: "Интерактивный учебный веб-сервис для практического освоения навыков промпт-инжиниринга",
    icons: {
        icon: "/favicon.ico",
    },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ru">
            <body className={`${roboto.className} antialiased min-h-screen`}>
              <PageLoader />
                <AuthGuard>{children}</AuthGuard>
            </body>
        </html>
    )
}