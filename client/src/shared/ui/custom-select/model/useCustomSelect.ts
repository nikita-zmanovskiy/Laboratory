"use client"

import {
	type KeyboardEvent,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react"

/**
 * Хук для управления кастомным селектом с клавиатурной навигацией и анимацией
 *
 * Поддерживает открытие/закрытие по клику и клавишам Enter/Space
 * Навигацию по опциям через ArrowDown/ArrowUp/Home/End
 * Выбор опции через Enter/Space/клик
 * Закрытие по Escape/Tab/клику вне селекта
 * Анимацию закрытия с задержкой CLOSE_ANIMATION_DURATION_MS
 * Блокировку взаимодействия при disabled
 *
 * @param value - текущее выбранное значение
 * @param options - массив опций с label и value
 * @param disabled - флаг блокировки селекта
 * @param onChange - колбэк при выборе опции
 * @returns rootRef - реф для контейнера селекта
 * @returns open - флаг открытия списка
 * @returns closing - флаг анимации закрытия
 * @returns selected - текущая выбранная опция
 * @returns activeIndex - индекс активной опции при навигации с клавиатуры
 * @returns toggle - переключение открытия/закрытия
 * @returns selectOption - выбор опции по значению
 * @returns setActiveIndex - установка активного индекса
 * @returns handleTriggerKeyDown - обработчик клавиатуры для триггера
 */

const CLOSE_ANIMATION_DURATION_MS = 150

export interface UseCustomSelectOption<T extends string | number> {
	label: string
	value: T
}

interface UseCustomSelectData<T extends string | number> {
    value: T
    options: readonly UseCustomSelectOption<T>[]
    disabled: boolean
}

interface UseCustomSelectHandlers<T extends string | number> {
    onChange: (value: T) => void
}

type UseCustomSelectParams<T extends string | number> = UseCustomSelectData<T> & UseCustomSelectHandlers<T>

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