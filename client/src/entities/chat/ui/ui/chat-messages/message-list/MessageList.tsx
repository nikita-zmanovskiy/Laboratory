import type { Message } from "../../../../types/message"
import { ChatMessage } from "../../message"

interface MessageListData {
    messages: Message[]
    isLoading: boolean
    isTextMode: boolean
}

interface MessageListHandlers {
    onImageClick: (url: string | null) => void
    onDownload: (e: React.MouseEvent, imageUrl: string, filename: string) => void
}

type MessageListProps = MessageListData & MessageListHandlers

export const MessageList = ({
    messages,
    isLoading,
    isTextMode,
    onImageClick,
    onDownload,
}: MessageListProps) => (
    <>
        {messages.map((message) => (
            <ChatMessage
                key={message.id}
                message={message}
                onImageClick={onImageClick}
                onDownload={onDownload}
            />
        ))}
        {isLoading && (
            <div className="animate-fadeIn mr-auto flex max-w-[75%] animate-pulse flex-col items-start gap-1.5">
                <div className="min-w-[200px] rounded-2xl rounded-tl-none border border-[var(--color-border-primary)] bg-[var(--color-bg-hover)] px-4 py-3 shadow-sm">
                    {isTextMode ? (
                        <div className="space-y-2 py-1">
                            <div className="h-3 w-5/6 rounded-md bg-[var(--color-bg-hover)]" />
                            <div className="h-3 w-full rounded-md bg-[var(--color-bg-hover)]" />
                            <div className="h-3 w-2/3 rounded-md bg-[var(--color-bg-hover)]" />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="h-3 w-3/4 rounded-md bg-[var(--color-bg-hover)]" />
                            <div className="flex h-48 w-64 items-center justify-center rounded-lg border border-dashed border-[var(--color-border-primary)] bg-[var(--color-bg-hover)]">
                                <span className="text-xs text-[var(--color-text-muted)]">Генерация изображения...</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}
    </>
)
