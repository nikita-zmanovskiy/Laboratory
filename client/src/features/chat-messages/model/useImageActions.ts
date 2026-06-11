import { useCallback,useState } from "react"

interface UseImageActionsReturn {
	activeImage: string | null
	setActiveImage: (url: string | null) => void
	handleDownload: (e: React.MouseEvent, imageUrl: string, filename: string) => Promise<void>
}

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
