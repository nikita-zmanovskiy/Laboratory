import { useCallback,useState } from "react"



interface UseImageActionsReturnData {
    activeImage: string | null
}

interface UseImageActionsReturnHandlers {
	setActiveImage: (url: string | null) => void
	handleDownload: (e: React.MouseEvent, imageUrl: string, filename: string) => Promise<void>
}

type UseImageActionsReturn = UseImageActionsReturnData & UseImageActionsReturnHandlers
/**
 * Хук для управления просмотром и скачиванием изображений
 *
 * Предоставляет состояние активного изображения для модального просмотра
 * handleDownload скачивает изображение через fetch + Blob с созданием ссылки
 * При ошибке fetch открывает изображение в новой вкладке как fallback
 *
 * @returns activeImage - URL активного изображения для просмотра или null
 * @returns setActiveImage - функция установки активного изображения
 * @returns handleDownload - функция скачивания изображения по URL
 */

export const useImageActions = (): UseImageActionsReturn => {
	const [activeImage, setActiveImage] = useState<string | null>(null)

	const handleDownload = useCallback(async (e: React.MouseEvent, imageUrl: string, filename: string) => {
		e.preventDefault()
		e.stopPropagation()
		try {
			const response = await fetch(imageUrl),
			 blob = await response.blob(),
			 url = window.URL.createObjectURL(blob),
			 link = document.createElement("a")
			 
			link.href = url
			link.download = filename
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
			window.URL.revokeObjectURL(url)
		} catch {
			const link = document.createElement("a")
			link.href = imageUrl
			link.target = "_blank"
			link.download = filename
			link.click()
		}
	}, [])

	return { activeImage, setActiveImage, handleDownload }
}
