import { useEffect, useRef } from "react"

/**
 * Хук для автоматической прокрутки чата вниз при новых сообщениях
 *
 * Использует setTimeout с задержкой 500мс перед scrollIntoView
 * чтобы дождаться рендера нового сообщения в DOM
 * Срабатывает при изменении количества сообщений или флага загрузки
 *
 * @param messageCount - количество сообщений для отслеживания изменений
 * @param isLoading - флаг загрузки (смена false->true->false триггерит прокрутку)
 * @returns bottomRef - реф на div в конце списка сообщений
 */

export const useAutoScroll = (messageCount: number, isLoading: boolean) => {
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const timer = setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 500)
        return () => clearTimeout(timer)
    }, [messageCount, isLoading])

    return bottomRef
}