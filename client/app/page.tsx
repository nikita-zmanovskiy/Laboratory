import type { Metadata } from "next"

import { HomePage } from "./HomePage"

export const metadata: Metadata = {
    title: "Промт-инженер | Лаборатория ИИ",
    description: "Интерактивный учебный веб-сервис для практического освоения навыков промт-инжиниринга школьниками. Работа с моделями GigaChat и Kandinsky.",
    keywords: ["промт-инжиниринг", "лаборатория ии", "промт-инженер", "обучение нейросетям", "gigachat", "kandinsky"],
}

export default function Page() {
    return <HomePage />
}