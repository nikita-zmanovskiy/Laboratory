import { create } from "zustand"

import { ChatStore } from "../types"

/**
 * Хранилище чата
 *
 * Управляет режимом чата (text/image), списком сообщений и состоянием загрузки
 * Сообщения ограничены последними 100 записями через slice(-99) при добавлении
 * Предоставляет методы для добавления, обновления, удаления и очистки сообщений
 */

// Review 26.06.2026 - больше для информации. Тут тоже удобно будет использовать соглашение для наименований функций. На уровне стора лучше не использовать префиксы, которые используется в слое api, что бы облегчить поиск в дальнейшем.
// Тут лушче называть функции максимально приблежненно к бизнес-логике. sendMessage, removeMessage (delete = в api слое), changeMessage и т.д.
// addMessage - ОК 👍, updateMessage - лучше сделать как changeMessage. В остальном все гуд 👍

// Так же все, если устанавливаем значение в самом сторе, то функция должна быть названа set* (setMode, setLoading, setMessages, setError). - тут все ОК 👍 - done
export const useChatStore = create<ChatStore>(
	(set) => ({
		mode: "text",
		messages: [],
		isLoading: false,
		error: null,
		setMode: (mode) => set({ mode }),
		setLoading: (isLoading) =>
			set({ isLoading }),
		addMessage: (message) =>
			set((state) => ({
				messages: [...state.messages.slice(-99), message]
			})),
		changeMessage: (id, fields) =>
			set((state) => ({
				messages: state.messages.map((msg) =>
					msg.id === id
						? { ...msg, ...fields }
						: msg,
				),
			})),
		removeMessage: (id) =>
			set((state) => ({
				messages: state.messages.filter(
					(msg) => msg.id !== id,
				),
			})),
		clearMessages: () => set({ messages: [] }),
		clearError: () => set({ error: null }),
	}),
)
