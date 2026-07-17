"use client"

import type { MouseEvent } from "react"

import type { Message } from "../../../types/message"
import { useChatMessage } from "../../hooks/useChatMessage"

import { MessageImage } from "./parts/MessageImage"
import { MessageText } from "./parts/MessageText"
import { TokenUsage } from "./parts/TokenUsage"

interface ChatMessageData {
  message: Message
}

interface ChatMessageHandlers {
  onImageClick: (url: string | null) => void
  onDownload: (event: MouseEvent, imageUrl: string, filename: string) => void
}

type ChatMessageProps = ChatMessageData & ChatMessageHandlers

const GENERATING_TEXT = "Генерация..."

export const ChatMessage = ({
  message,
  onImageClick,
  onDownload,
}: ChatMessageProps) => {
  const {
    visible,
    displayText,
    textOpacity,
    isUser,
    isGenerating,
    generatedImageSrc,
  } = useChatMessage(message)

  const containerClassName = `flex max-w-[75%] flex-col gap-1.5 transition-all duration-[400ms] ${
    visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
  } ${isUser ? "ml-auto items-end" : "mr-auto items-start"}`

  if (isGenerating) {
    return (
      <div className={containerClassName}>
        <div className="max-w-[100%] rounded-2xl rounded-tl-none bg-[var(--color-bg-secondary)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] shadow-sm">
          <div className="flex items-center gap-2">
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-border-primary)] border-t-[var(--color-text-primary)]"
              aria-hidden="true"
            />
            <span className="text-[var(--color-text-secondary)]">
              {GENERATING_TEXT}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className={`page__animation ${containerClassName}`}>
      <div
        className={`max-w-[100%] rounded-2xl px-4 py-2.5 text-sm ${
          isUser
            ? "rounded-tr-none bg-blue-600 text-[var(--color-text-primary)]"
            : "text-[var(--color-text-primary)]"
        }`}
      >
        {displayText && (
          <MessageText
            text={displayText}
            isUser={isUser}
            isVisible={textOpacity}
          />
        )}

        {message.attachedImage && (
          <MessageImage
            src={message.attachedImage}
            alt="Прикрепленное изображение"
            wrapperClassName="mt-2 max-w-sm cursor-zoom-in"
            onImageClick={onImageClick}
          />
        )}

        {generatedImageSrc && (
          <MessageImage
            src={generatedImageSrc}
            alt="Сгенерированное изображение"
            wrapperClassName="group relative ml-5 mt-2 max-w-sm cursor-zoom-in"
            onImageClick={onImageClick}
            download={{
              filename: `ai-image-${message.id}.png`,
              onDownload,
            }}
          />
        )}

        {message.role === "assistant" && message.tokens && (
          <TokenUsage
            tokens={message.tokens}
            isApproximate={message.isApproximate}
            hasGeneratedImage={Boolean(message.generatedImage)}
          />
        )}
      </div>
    </article>
  );
};
