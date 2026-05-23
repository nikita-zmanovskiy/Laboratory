import ReactMarkdown from "react-markdown"

interface MessageTextProps {
    text: string
    isUser: boolean
    isVisible: boolean
}

export const MessageText = ({ text, isUser, isVisible }: MessageTextProps) => {
    if (isUser) {
        return (
            <p className="leading-relaxed text-[var(--color-user-text-message)] whitespace-pre-wrap break-words max-w-[380px]">
                {text}
            </p>
        )
    }

    return (
        <div className={`rounded-2xl px-6 py-5.5 shadow-sm bg-[var(--color-bg-secondary)] rounded-tl-none leading-relaxed break-words transition-all duration-700 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}>
            <ReactMarkdown
                components={{
                    h1: ({ children }) => <h3 className="text-base font-semibold text-[var(--color-text-primary)] mt-2 mb-1">{children}</h3>,
                    h2: ({ children }) => <h3 className="text-base font-semibold text-[var(--color-text-primary)] mt-2 mb-1">{children}</h3>,
                    h3: ({ children }) => <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mt-2 mb-1">{children}</h3>,
                    strong: ({ children }) => <strong className="font-bold text-[var(--color-text-primary)]">{children}</strong>,
                    em: ({ children }) => <em className="italic text-[var(--color-text-primary)]">{children}</em>,
                    p: ({ children }) => <p className="my-1 text-[var(--color-text-primary)]">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc ml-4 my-1 text-[var(--color-text-primary)]">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal ml-4 my-1 text-[var(--color-text-primary)]">{children}</ol>,
                    li: ({ children }) => <li className="my-0.5">{children}</li>,
                    code: ({ children }) => <code className="bg-[var(--color-bg-hover)] px-1.5 py-0.5 rounded text-sm">{children}</code>,
                    pre: ({ children }) => <pre className="bg-[var(--color-bg-hover)] p-3 rounded-xl my-2 overflow-x-auto">{children}</pre>,
                }}
            >
                {text}
            </ReactMarkdown>
        </div>
    )
}
