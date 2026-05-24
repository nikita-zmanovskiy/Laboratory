"use client"

import { useId } from "react"

import { useCodeInput } from "../model/useCodeInput"

import styles from "./Modal.module.css"

interface CodeInputProps {
  code: string
  isLoading: boolean
  error: string | null
  onCodeChange: (value: string) => void
  onSubmit: () => void
  onBack: () => void
}

export const CodeInput = ({
  code,
  isLoading,
  error,
  onCodeChange,
  onSubmit,
  onBack,
}: CodeInputProps) => {
  const titleId = useId(),
   descriptionId = useId()

  const {
    inputRef,
    visibleError,
    showHint,
    isFocused,
    setIsFocused,
    focusInput,
    handleCodeChange,
    handleKeyDown,
    codeLength,
  } = useCodeInput({
    code,
    error,
    isLoading,
    onCodeChange,
    onSubmit,
  });

  return (
    <main
      className={`${styles.code__wrapper} page__animation-opacity flex h-screen items-center justify-center`}
    >
      <section
        className="page__animation relative flex w-100 flex-col items-center gap-4 rounded-2xl"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        {isLoading && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-[var(--color-loading-white)]"
            role="status"
            aria-live="polite"
            aria-label="Подключаемся к классу"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="relative h-10 w-10" aria-hidden="true">
                <div className="absolute inset-0 rounded-full border-2 border-white/20" />
                <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[var(--color-text-primary)]" />
              </div>

              <p className="text-sm text-[var(--color-text-primary)]">
                Подключаемся к классу...
              </p>
            </div>
          </div>
        )}

        <header className="flex items-center gap-2">
          <h1
            id={titleId}
            className="text-lg font-semibold text-[var(--color-text-primary)]"
          >
            Код класса
          </h1>

          <svg
            fill="var(--color-text-primary)"
            xmlns="http://www.w3.org/2000/svg"
            width="19"
            height="19"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M20,15 L20,13 L21,13 C21.5522847,13 22,12.5522847 22,12 C22,11.4477153 21.5522847,11 21,11 L11.9514124,11 L11.7157487,10.3332461 C11.0154711,8.35197855 9.13614903,7 7,7 C4.23857625,7 2,9.23857625 2,12 C2,14.7614237 4.23857625,17 7,17 C9.13614903,17 11.0154711,15.6480214 11.7157487,13.6667539 L11.9514124,13 L18,13 L18,15 L20,15 Z M22,17 L16,17 L16,15 L13.326396,15 C12.1852426,17.4064194 9.74415335,19 7,19 C3.13400675,19 0,15.8659932 0,12 C0,8.13400675 3.13400675,5 7,5 C9.74415335,5 12.1852426,6.59358057 13.326396,9 L21,9 C22.6568542,9 24,10.3431458 24,12 C24,13.3062188 23.1651924,14.4174579 22,14.8292943 L22,17 Z M7,14 C8.1045695,14 9,13.1045695 9,12 C9,10.8954305 8.1045695,10 7,10 C5.8954305,10 5,10.8954305 5,12 C5,13.1045695 5.8954305,14 7,14 Z" />
          </svg>
        </header>

        <div id={descriptionId} className="relative h-6 w-full">
          <p
            className={`absolute inset-0 text-center text-sm text-[var(--color-text-muted)] transition-all duration-300 ${
              showHint && !visibleError
                ? "translate-y-0 opacity-100"
                : "-translate-y-2 opacity-0"
            }`}
          >
            Введите код комнаты, чтобы войти
          </p>

          <p
            className={`absolute inset-0 text-center text-sm text-[var(--color-text-error)] transition-all duration-300 ${
              visibleError
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0"
            }`}
            role={visibleError ? "alert" : undefined}
          >
            {visibleError || ""}
          </p>
        </div>

        <div
          className="relative"
          onClick={focusInput}
          role="group"
          aria-label="Код комнаты"
        >
          <input
            ref={inputRef}
            type="text"
            value={code}
            onChange={handleCodeChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            maxLength={codeLength}
            disabled={isLoading}
            autoComplete="off"
            inputMode="text"
            aria-label="Введите код комнаты"
            className="absolute h-0 w-0 opacity-0"
          />

          <div className="flex gap-3 max-[576px]:gap-1">
            {Array.from({ length: codeLength }, (_, index) => {
              const isFilled = Boolean(code[index]);
              const isNext =
                isFocused && code.length < codeLength && index === code.length;

              return (
                <div
                  key={index}
                  className={`flex h-14 w-12 items-center justify-center rounded-xl border-2 text-xl font-bold transition-all duration-200 ${
                    isFilled
                      ? "border-[#ff5d86] bg-[#ff5d86]/10 text-[var(--color-text-primary)] shadow-[0_0_10px_rgba(255,93,134,0.15)]"
                      : isNext
                        ? "border-[#ff5d86]/40 bg-[#ff5d86]/5 text-[var(--color-text-secondary)] shadow-[0_0_6px_rgba(255,93,134,0.08)]"
                        : "border-[var(--color-border-primary)] text-[var(--color-text-muted)]"
                  } ${!isLoading ? "cursor-text" : "cursor-default"}`}
                  aria-hidden="true"
                >
                  {code[index] || ""}
                </div>
              );
            })}
          </div>
        </div>

        <footer className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="cursor-pointer rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] px-6 py-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Назад
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={isLoading || code.length !== codeLength}
            className={`rounded-xl px-6 py-2 text-sm font-medium text-white transition-all ${
              isLoading
                ? "cursor-wait bg-[#ff5d867a]"
                : code.length === codeLength
                  ? "cursor-pointer bg-[#ff5d86] hover:bg-[#ff5d867a]/90"
                  : "cursor-not-allowed bg-[#ff5d862f]"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2" aria-hidden="true">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              </span>
            ) : (
              "Войти"
            )}
          </button>
        </footer>
      </section>
    </main>
  )
}