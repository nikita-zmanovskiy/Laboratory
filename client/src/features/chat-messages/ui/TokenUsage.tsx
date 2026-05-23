import type { Message } from "@/entities/chat"

interface TokenUsageProps {
    tokens: NonNullable<Message["tokens"]>
    isApproximate?: boolean
    hasGeneratedImage?: boolean
}

export const TokenUsage = ({ tokens, isApproximate, hasGeneratedImage }: TokenUsageProps) => (
    <div className={`mt-2 flex items-center ml-5 gap-1.5 ${hasGeneratedImage ? "" : "border-t border-[var(--color-border-primary)] pt-1.5"} font-mono text-[10px] text-[var(--color-text-muted)] select-none`}>
        <span className="font-semibold text-[var(--color-text-secondary)]">Токены:</span>
        <span>входные: {tokens.input}</span>
        <span>выходные: {tokens.output}</span>
        {isApproximate && (
            <span className="text-amber-400 italic" title="Токены оценены приблизительно">
                (приблизительно)
            </span>
        )}
    </div>
)
