import { useCallback, useEffect, useState } from "react"

import { useFileUpload,useSendMessage } from "@/features/send-message"

import { useChatStore } from "@/entities/chat"

interface UseChatInputReturn {
    inputValue: string
    isTextMode: boolean
    isLoading: boolean
    isImageLoading: boolean
    isOnline: boolean
    displayError: string | null
    imagePreview: string | null
    fileInputRef: React.RefObject<HTMLInputElement | null>
    onInputChange: (value: string) => void
    onSend: (e?: React.FormEvent) => void
    onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onRemoveFile: () => void
}

export const useChatInput = (): UseChatInputReturn => {
    const mode = useChatStore((state) => state.mode),
     [inputValue, setInputValue] = useState(""),
     [isOnline, setIsOnline] = useState(true)

    const { isLoading, error: sendError, sendMessage } = useSendMessage(),
     {
        imagePreview,
        isImageLoading,
        fileInputRef,
        error: fileError,
        handleFileChange,
        handleRemoveFile,
        convertToBase64,
        clearFile,
        imageFile,
    } = useFileUpload(isLoading)

    const isTextMode = mode === "text",
     displayError = sendError || fileError

    useEffect(() => {
        setIsOnline(navigator.onLine)
        const handleOnline = () => setIsOnline(true),
         handleOffline = () => setIsOnline(false)
        window.addEventListener("online", handleOnline)
        window.addEventListener("offline", handleOffline)
        return () => {
            window.removeEventListener("online", handleOnline)
            window.removeEventListener("offline", handleOffline)
        }
    }, [])

    const handleSend = useCallback(async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!inputValue.trim() || isLoading || isImageLoading) return

        const prompt = inputValue,
         preview = imagePreview
        setInputValue("")

        let imageBase64: string | null = null
        if (imageFile) {
            imageBase64 = await convertToBase64()
            if (!imageBase64 && fileError) return
        }

        clearFile()
        await sendMessage(prompt, imageBase64, isTextMode, preview)
    }, [inputValue, isLoading, isImageLoading, isTextMode, imageFile, imagePreview, convertToBase64, clearFile, sendMessage, fileError])

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }, [handleSend])

    return {
        inputValue,
        isTextMode,
        isLoading,
        isImageLoading,
        isOnline,
        displayError,
        imagePreview,
        fileInputRef,
        onInputChange: setInputValue,
        onSend: handleSend,
        onKeyDown: handleKeyDown,
        onFileChange: handleFileChange,
        onRemoveFile: handleRemoveFile,
    }
}
