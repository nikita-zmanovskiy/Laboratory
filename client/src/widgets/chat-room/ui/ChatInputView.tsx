"use client";


import { FilePreview, SendButton } from "@/features/send-message"

import { CHAT_INPUT_MAX_LENGTH } from "@/shared/config/chat"

import { AttachmentButton } from "./AttachmentButton"

import styles from "./chatInput.module.css"
import { ChatInputViewProps } from "../types";


export const ChatInputView = ({
  inputValue,
  isTextMode,
  isLoading,
  isImageLoading,
  isOnline,
  displayError,
  imagePreview,
  fileInputRef,
  modeToggleSlot,
  onInputChange,
  onSend,
  onKeyDown,
  onFileChange,
  onRemoveFile,
}: ChatInputViewProps) => {
  const isSendDisabled =
    !inputValue.trim() ||
    inputValue.length > CHAT_INPUT_MAX_LENGTH ||
    isImageLoading ||
    !isOnline

  return (
    <div
      className={`${styles["glass-gradient-wrapper"]} ${styles.chatInput__wrapper} page__animation-opacity relative w-full `}
    >
      <div className={styles["glow-blur-layer"]} />
      <div className={styles.input__overlay} />

      <form
        onSubmit={onSend}
        className={`${styles["glass-inner"]} space-y-3 p-4`}
      >
        {imagePreview && (
          <FilePreview
            imagePreview={imagePreview}
            isLoading={isLoading}
            onRemove={onRemoveFile}
          />
        )}

        <div className="relative">
          <textarea
            value={inputValue}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Введите свой запрос..."
            maxLength={CHAT_INPUT_MAX_LENGTH}
            disabled={isLoading || !isOnline}
            className="max-h-32 min-h-[44px] w-full resize-none overflow-y-auto bg-transparent px-2 pt-2 pb-8 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none disabled:opacity-50"
          />

          <div
            className={`${styles.input__limit} absolute right-3 bottom-3 font-mono text-[11px] ${
              inputValue.length >= CHAT_INPUT_MAX_LENGTH
                ? "font-bold text-[var(--color-text-error)]"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            {inputValue.length}/{CHAT_INPUT_MAX_LENGTH}
          </div>
        </div>

        <div className="flex w-full pt-1 max-[500px]:flex-col max-[500px]:gap-3 min-[500px]:items-center min-[500px]:justify-between">
          <div className="flex items-center gap-4 max-[500px]:w-full max-[500px]:justify-center">
            {modeToggleSlot}

            <AttachmentButton
              isLoading={isLoading}
              isImageLoading={isImageLoading}
              isOnline={isOnline}
              onFileChange={onFileChange}
              fileInputRef={fileInputRef}
              visible
            />

            {displayError && (
              <span
                className="text-xs font-medium text-[var(--color-text-error)]"
                role="alert"
              >
                {displayError}
              </span>
            )}
          </div>

          <div className="flex items-center">
            <SendButton
              isLoading={isLoading}
              isDisabled={isSendDisabled}
              isTextMode={isTextMode}
            />
          </div>
        </div>
      </form>
    </div>
  )
}