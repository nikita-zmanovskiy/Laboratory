"use client"

import type { ChangeEvent, RefObject } from "react"

import { useAnimatedVisibility } from "../model/useAnimatedVisibility"

interface AttachmentButtonProps {
  isLoading: boolean
  isImageLoading: boolean
  isOnline: boolean
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void
  fileInputRef: RefObject<HTMLInputElement | null>
  visible: boolean
}

export const AttachmentButton = ({
  isLoading,
  isImageLoading,
  isOnline,
  onFileChange,
  fileInputRef,
  visible,
}: AttachmentButtonProps) => {
  const { shouldRender, isAnimatedIn } = useAnimatedVisibility(visible)

  if (!shouldRender) {
    return null
  }

  const isDisabled = isLoading || isImageLoading || !isOnline

  return (
    <div
      className={`flex h-9 items-center justify-center transition-all duration-300 ${
        isAnimatedIn
          ? "translate-y-0 scale-100 opacity-100"
          : "translate-y-2 scale-95 opacity-0"
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept=".jpg,.jpeg,.png,.webp"
        disabled={isDisabled}
        className="hidden"
        id="image-upload-input"
      />

      {isImageLoading ? (
        <span
          className="h-5 w-5 animate-spin rounded-full border-2 border-gray-600 border-t-gray-200"
          aria-label="Загрузка изображения"
          role="status"
        />
      ) : (
        <label
          htmlFor="image-upload-input"
          className={`flex cursor-pointer items-center justify-center rounded-xl p-2 text-gray-400 transition-colors hover:bg-message-ai hover:text-foreground ${
            isDisabled ? "pointer-events-none opacity-50" : ""
          }`}
          title="Прикрепить изображение"
          aria-label="Прикрепить изображение"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </label>
      )}
    </div>
  )
}