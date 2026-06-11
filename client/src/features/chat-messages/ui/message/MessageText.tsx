"use client"

import ReactMarkdown from "react-markdown"

interface MessageTextProps {
  text: string
  isUser: boolean
  isVisible: boolean
}

export const MessageText = ({
  text,
  isUser,
  isVisible,
}: MessageTextProps) => {
  const visibilityClassName = isVisible ? "opacity-100" : "opacity-0"

  if (isUser) {
    return (
      <p
        className={`whitespace-pre-wrap text-white break-words transition-opacity duration-300 ${visibilityClassName}`}
      >
        {text}
      </p>
    )
  }

  return (
    <div
      className={`break-words bg-[var(--color-bg-secondary)] p-5 rounded-tr-2xl rounded-br-2xl shadow-sm rounded-bl-2xl text-[var(--color-text-primary)] transition-opacity duration-300 ${visibilityClassName}`}
    >
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 whitespace-pre-wrap">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-2 list-disc space-y-1 pl-5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2 list-decimal space-y-1 pl-5">{children}</ol>
          ),
          li: ({ children }) => <li>{children}</li>,
          code: ({ children }) => (
            <code className="rounded bg-[var(--color-bg-hover)] px-1 py-0.5 text-xs">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="my-2 overflow-x-auto rounded-lg bg-[var(--color-bg-hover)] p-3 text-xs">
              {children}
            </pre>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--color-accent)] underline underline-offset-2"
            >
              {children}
            </a>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}