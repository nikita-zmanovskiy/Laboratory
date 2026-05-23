import { useCallback,useRef, useState } from "react"

import { isValidBase64Image,toBase64 } from "@/shared"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_FILE_SIZE = 5 * 1024 * 1024

interface UseFileUploadReturn {
    imageFile: File | null
    imagePreview: string | null
    isImageLoading: boolean
    error: string | null
    fileInputRef: React.RefObject<HTMLInputElement | null>
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
    handleRemoveFile: () => void
    convertToBase64: () => Promise<string | null>
    clearFile: () => void
}

export const useFileUpload = (isLoading: boolean): UseFileUploadReturn => {
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [isImageLoading, setIsImageLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        

        setError(null)

        if (!ALLOWED_TYPES.includes(file.type)) {
            setError("Допустимы только форматы JPG, PNG и WEBP")
            return
        }

        if (file.size > MAX_FILE_SIZE) {
            setError("Максимальный размер файла - 5 МБ")
            return
        }

        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
    }, [])

    const handleRemoveFile = useCallback(() => {
        if (isLoading) return
        setImageFile(null)
        setError(null)
        if (imagePreview) URL.revokeObjectURL(imagePreview)
        setImagePreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }, [isLoading, imagePreview])

    const convertToBase64 = useCallback(async (): Promise<string | null> => {
        if (!imageFile) return null
        const base64Result = await toBase64(imageFile)
        if (!isValidBase64Image(base64Result)) {
            setError("Файл поврежден или имеет некорректный формат данных")
            return null
        }
        return base64Result
    }, [imageFile])

    const clearFile = useCallback(() => {
        setImageFile(null)
        setImagePreview(null)
        setError(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }, [])

    return {
        imageFile,
        imagePreview,
        isImageLoading,
        error,
        fileInputRef,
        handleFileChange,
        handleRemoveFile,
        convertToBase64,
        clearFile,
    }
}