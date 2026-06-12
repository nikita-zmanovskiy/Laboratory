import { useCallback,useRef, useState } from "react"

import { toBase64 } from "@/shared/lib/toBase64"
import { isValidBase64Image } from "@/shared/lib/validateBase64"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"],
 MAX_FILE_SIZE = 5 * 1024 * 1024

 interface UseFileUploadData {
    imageFile: File | null
    imagePreview: string | null
    isImageLoading: boolean
    error: string | null
    fileInputRef: React.RefObject<HTMLInputElement | null>
}

interface UseFileUploadHandlers {
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
    handleRemoveFile: () => void
    convertToBase64: () => Promise<string | null>
    clearFile: () => void
}

type UseFileUploadReturn = UseFileUploadData & UseFileUploadHandlers

/**
 * Хук для загрузки и валидации файлов изображений
 *
 * Принимает файл через input, проверяет тип (JPG/PNG/WEBP) и размер (макс 5 МБ)
 * Создаёт preview через URL.createObjectURL
 * Предоставляет convertToBase64 для преобразования файла в base64 строку
 * с проверкой валидности через isValidBase64Image
 * Блокирует удаление файла во время загрузки через isLoading
 *
 * @param isLoading - флаг блокировки удаления файла (во время отправки сообщения)
 * @returns imageFile - выбранный файл или null
 * @returns imagePreview - URL для предпросмотра или null
 * @returns isImageLoading - флаг процесса конвертации в base64
 * @returns error - текст ошибки валидации или null
 * @returns fileInputRef - реф на input элемент
 * @returns handleFileChange - обработчик выбора файла
 * @returns handleRemoveFile - удаление выбранного файла и очистка preview
 * @returns convertToBase64 - конвертация файла в base64 строку
 * @returns clearFile - полная очистка файла без проверки isLoading
 */

export const useFileUpload = (isLoading: boolean): UseFileUploadReturn => {
    const [imageFile, setImageFile] = useState<File | null>(null),
     [imagePreview, setImagePreview] = useState<string | null>(null),
     [isImageLoading, setIsImageLoading] = useState(false),
     [error, setError] = useState<string | null>(null),
     fileInputRef = useRef<HTMLInputElement | null>(null)

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
        setIsImageLoading(true)
        try {
            const base64Result = await toBase64(imageFile)
            if (!isValidBase64Image(base64Result)) {
                setError("Файл поврежден или имеет некорректный формат данных")
                return null
            }
            return base64Result
        } finally {
            setIsImageLoading(false)
        } 
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