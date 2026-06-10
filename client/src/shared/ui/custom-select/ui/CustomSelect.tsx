"use client";

import { useId } from "react";

import { useCustomSelect } from "../model/useCustomSelect";

import styles from "./customSelect.module.css";

export interface CustomSelectOption<T extends string | number = string> {
	label: string;
	value: T;
}

interface CustomSelectProps<T extends string | number = string> {
	value: T;
	options: CustomSelectOption<T>[];
	onChange: (value: T) => void;
	disabled?: boolean;
	label?: string;
	placeholder?: string;
	compact?: boolean;
	className?: string;
}

export function CustomSelect<T extends string | number = string>({
	value,
	options,
	onChange,
	disabled = false,
	label,
	placeholder = "Выберите...",
	compact = false,
	className = "",
}: CustomSelectProps<T>) {
	const selectId = useId(),
	 listboxId = `${selectId}-listbox`,
	 labelId = `${selectId}-label`

	const { rootRef, open, closing, selected, toggle, selectOption } =
		useCustomSelect<T>({
			value,
			options,
			disabled,
			onChange,
		});

	return (
		<div ref={rootRef} className={`relative ${className}`}>
			{label && (
				<label
					id={labelId}
					className={`block text-sm font-medium ${styles.label} ${
						compact ? "" : "mb-1"
					}`}
				>
					{label}
				</label>
			)}

			<button
				type="button"
				onClick={toggle}
				disabled={disabled}
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-controls={open ? listboxId : undefined}
				aria-labelledby={label ? labelId : undefined}
				className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl text-left text-sm disabled:cursor-not-allowed disabled:opacity-50 ${styles.trigger} ${
					compact ? `${styles.triggerCompact} px-3 py-1.5` : "mt-1 px-4 py-3"
				}`}
			>
				<span
					className={
						selected
							? "text-[var(--color-text-primary)]"
							: "text-[var(--color-text-muted)]"
					}
				>
					{selected ? selected.label : placeholder}
				</span>

				<svg
					className={`h-4 w-4 shrink-0 text-[var(--color-text-secondary)] transition-transform duration-200 ${
						open && !closing ? "rotate-180" : ""
					}`}
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<polyline points="6 9 12 15 18 9" />
				</svg>
			</button>

			{open && (
				<div
					id={listboxId}
					role="listbox"
					aria-labelledby={label ? labelId : undefined}
					className={`${styles.dropdown} absolute z-30 mt-1 w-full min-w-full rounded-xl border border-[var(--color-border-primary)] py-1 shadow-xl ${
						closing ? styles.closing : ""
					}`}
				>
					{options.map((option) => {
						const selectedOption = option.value === value;

						return (
							<button
								key={String(option.value)}
								type="button"
								role="option"
								aria-selected={selectedOption}
								onClick={() => selectOption(option.value)}
								className={`w-full cursor-pointer px-4 py-2.5 text-left text-sm transition-colors hover:bg-[var(--color-bg-hover)] ${
									selectedOption
										? "text-[var(--color-accent)]"
										: "text-[var(--color-text-primary)]"
								} ${compact ? "py-2" : ""}`}
							>
								{option.label}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}