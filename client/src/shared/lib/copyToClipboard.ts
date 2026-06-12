/**
 * Копирует текст в буфер обмена
 *
 * Сначала пробует современный navigator.clipboard.writeText
 * При неудаче использует fallback через textarea и document.execCommand("copy")
 *
 * @param text - строка для копирования
 * @returns true если копирование успешно
 */

export const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch {
        const textarea = document.createElement("textarea")
        textarea.value = text
        textarea.style.position = "fixed"
        textarea.style.opacity = "0"
        document.body.appendChild(textarea)
        textarea.select()
        //команда для копирования текста в буфер обмена старое
        document.execCommand("copy")
        document.body.removeChild(textarea)
        return true
    }
}