interface Tokens {
    input?: number
    output?: number
    total?: number
    input_tokens?: number
    output_tokens?: number
    total_tokens?: number
    tokens_input?: number
    tokens_output?: number
    tokens_total?: number
  }
  
  interface TokenUsageProps {
    tokens: Tokens
    isApproximate?: boolean
    hasGeneratedImage?: boolean
  }
  
  const getTokenValue = (...values: Array<number | undefined>) => {
    return values.find((value) => typeof value === "number") ?? 0
  };
  
  export const TokenUsage = ({
    tokens,
    isApproximate = false,
    hasGeneratedImage = false,
  }: TokenUsageProps) => {
    const inputTokens = getTokenValue(
      tokens.input,
      tokens.input_tokens,
      tokens.tokens_input,
    );
  
    const outputTokens = getTokenValue(
      tokens.output,
      tokens.output_tokens,
      tokens.tokens_output,
    );
  
    const totalTokens = getTokenValue(
      tokens.total,
      tokens.total_tokens,
      tokens.tokens_total,
      inputTokens + outputTokens,
    )
    if (!inputTokens && !outputTokens && !totalTokens && !hasGeneratedImage) {
      return null
    }
  
    return (
      <div className={`mt-2 flex flex-wrap items-center gap-2 ${hasGeneratedImage ? '' : 'border-t border-[var(--color-border-primary)]'} pt-2 text-[10px] text-[var(--color-text-muted)]`}>
        {hasGeneratedImage && (
          <span className="rounded-full bg-[var(--color-bg-hover)] px-2 py-0.5">
            Изображение
          </span>
        )}
  
        <span className="rounded-full bg-[var(--color-bg-hover)] px-2 py-0.5">
          Вход: {inputTokens}
        </span>
  
        <span className="rounded-full bg-[var(--color-bg-hover)] px-2 py-0.5">
          Выход: {outputTokens}
        </span>
  
        <span className="rounded-full bg-[var(--color-bg-hover)] px-2 py-0.5">
          Всего: {totalTokens}
        </span>
  
        {isApproximate && (
          <span
            className="rounded-full bg-[var(--color-warning)]/10 px-2 py-0.5 text-[var(--color-warning)]"
            title="Количество токенов рассчитано приблизительно"
          >
            Приблизительно
          </span>
        )}
      </div>
    );
  };