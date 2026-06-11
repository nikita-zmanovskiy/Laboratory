import { create } from "zustand"

import { ChatStore } from "../types"



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
		updateMessage: (id, fields) =>
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
