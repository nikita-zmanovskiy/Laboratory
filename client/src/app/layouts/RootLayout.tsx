import type { Metadata } from "next"
import { Roboto } from "next/font/google"

import { PageLoader } from "@/shared/ui/page-loader/ui/PageLoader"
import { ThemeToggle } from "@/shared/ui/theme/ui/ThemeToggle"

import { ServiceWorkerProvider } from "../providers/ServiceWorkerProvider"
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
    themeColor: "#08090c",
}

export const metadata: Metadata = {
    title: "Промт-инженер | Лаборатория ИИ",
    description: "Интерактивный учебный веб-сервис для практического освоения навыков промпт-инжиниринга",
    icons: {
        icon: "/favicon.ico",
        apple: "/icons/icon-192.webp",
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "Лаборатория",
    },
    formatDetection: {
        telephone: false,
    },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ru">
            <body className={`${roboto.className} antialiased min-h-screen`}>
                <ServiceWorkerProvider />
                <PageLoader />
                <AuthGuard>{children}</AuthGuard>
                <ThemeToggle />
            </body>
        </html>
    )
}