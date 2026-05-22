import { create } from "zustand";
import { ChatMode, Message } from "../types";

interface ChatStore {
	mode: ChatMode;
	messages: Message[];
	isLoading: boolean;
	setMode: (mode: ChatMode) => void;
	setLoading: (loading: boolean) => void;
	addMessage: (message: Message) => void;
	updateMessage: (
		id: string,
		fields: Partial<Omit<Message, "id">>,
	) => void;
	removeMessage: (id: string) => void;
	clearMessages: () => void;
	error: string | null
    clearError: () => void
}

export const useChatStore = create<ChatStore>(
	(set) => ({
		mode: "text",
		messages: [],
		isLoading: false,
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
		error: null,
   		 clearError: () => set({ error: null }),
	
	}),
);
