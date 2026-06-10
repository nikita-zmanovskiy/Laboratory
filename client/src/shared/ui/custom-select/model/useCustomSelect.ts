"use client"

import {
	type KeyboardEvent,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react"

const CLOSE_ANIMATION_DURATION_MS = 150

export interface UseCustomSelectOption<T extends string | number> {
	label: string
	value: T
}

interface UseCustomSelectParams<T extends string | number> {
	value: T
	options: UseCustomSelectOption<T>[]
	disabled: boolean
	onChange: (value: T) => void
}

export const useCustomSelect = <T extends string | number>({
	value,
	options,
	disabled,
	onChange,
}: UseCustomSelectParams<T>) => {
	const [open, setOpen] = useState(false),
	 [closing, setClosing] = useState(false),
	 [activeIndex, setActiveIndex] = useState(0)

	const rootRef = useRef<HTMLDivElement | null>(null),
	 closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const selectedIndex = useMemo(
		() => options.findIndex((option) => option.value === value),
		[options, value],
	)

	const selected = selectedIndex >= 0 ? options[selectedIndex] : null

	// используем useCallback для того чтобы не создавать новые функции при каждом рендере
	const clearCloseTimer = useCallback(() => {
		if (closeTimerRef.current) {
			clearTimeout(closeTimerRef.current)
			closeTimerRef.current = null
		}
	}, []);

	const openSelect = useCallback(() => {
		if (disabled || options.length === 0) {
			return
		}
		clearCloseTimer()
		setClosing(false)
		setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
		setOpen(true)
	}, [clearCloseTimer, disabled, options.length, selectedIndex])

	const closeSelect = useCallback(
		(withAnimation = true) => {
			if (!open) {
				return
			}

			clearCloseTimer()

			if (!withAnimation) {
				setOpen(false)
				setClosing(false)
				return
			}

			setClosing(true)

			closeTimerRef.current = setTimeout(() => {
				setOpen(false)
				setClosing(false)
				closeTimerRef.current = null
			}, CLOSE_ANIMATION_DURATION_MS)
		},
		[clearCloseTimer, open],
	);

	const toggle = useCallback(() => {
		if (disabled) {
			return
		}

		if (open && !closing) {
			closeSelect()
			return
		}

		openSelect()
	}, [closeSelect, closing, disabled, open, openSelect])

	const selectOption = useCallback(
		(nextValue: T) => {
			if (disabled) {
				return
			}

			onChange(nextValue)
			closeSelect()
		},
		[closeSelect, disabled, onChange],
	);

	const selectActiveOption = useCallback(() => {
		const activeOption = options[activeIndex];

		if (!activeOption) {
			return;
		}

		selectOption(activeOption.value);
	}, [activeIndex, options, selectOption]);

	const moveActiveIndex = useCallback(
		(direction: 1 | -1) => {
			if (options.length === 0) {
				return;
			}

			setActiveIndex((currentIndex) => {
				const nextIndex = currentIndex + direction;

				if (nextIndex < 0) {
					return options.length - 1;
				}

				if (nextIndex >= options.length) {
					return 0;
				}

				return nextIndex;
			});
		},
		[options.length],
	);

	const handleTriggerKeyDown = useCallback(
		(event: KeyboardEvent<HTMLButtonElement>) => {
			if (disabled) {
				return;
			}

			switch (event.key) {
				case "Enter":
				case " ": {
					event.preventDefault();

					if (!open) {
						openSelect();
						return;
					}

					selectActiveOption();
					break;
				}

				case "ArrowDown": {
					event.preventDefault();

					if (!open) {
						openSelect();
						return;
					}

					moveActiveIndex(1);
					break;
				}

				case "ArrowUp": {
					event.preventDefault();

					if (!open) {
						openSelect();
						return;
					}

					moveActiveIndex(-1);
					break;
				}

				case "Home": {
					if (!open || options.length === 0) {
						return;
					}

					event.preventDefault();
					setActiveIndex(0);
					break;
				}

				case "End": {
					if (!open || options.length === 0) {
						return;
					}

					event.preventDefault();
					setActiveIndex(options.length - 1);
					break;
				}

				case "Escape": {
					if (!open) {
						return;
					}

					event.preventDefault();
					closeSelect(false);
					break;
				}

				case "Tab": {
					closeSelect(false);
					break;
				}

				default:
					break;
			}
		},
		[
			closeSelect,
			disabled,
			moveActiveIndex,
			open,
			openSelect,
			options.length,
			selectActiveOption,
		],
	);

	useEffect(() => {
		if (!open) {
			return;
		}

		const handleOutsidePointerDown = (event: MouseEvent | TouchEvent) => {
			const target = event.target;

			if (!(target instanceof Node)) {
				return;
			}

			if (!rootRef.current?.contains(target)) {
				closeSelect();
			}
		};

		document.addEventListener("mousedown", handleOutsidePointerDown);
		document.addEventListener("touchstart", handleOutsidePointerDown);

		return () => {
			document.removeEventListener("mousedown", handleOutsidePointerDown);
			document.removeEventListener("touchstart", handleOutsidePointerDown);
		};
	}, [closeSelect, open]);

	useEffect(() => {
		if (!open) {
			setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
		}
	}, [open, selectedIndex]);

	useEffect(() => {
		return () => {
			clearCloseTimer();
		};
	}, [clearCloseTimer]);

	return {
		rootRef,
		open,
		closing,
		selected,
		activeIndex,
		toggle,
		selectOption,
		setActiveIndex,
		handleTriggerKeyDown,
	};
};