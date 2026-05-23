import { create } from "zustand";

import { initSession } from "../lib/initSession";

interface SessionStore {
	sessionId: string | null;
	initialize: () => void;
}

export const useSessionStore =
	create<SessionStore>((set) => ({
		sessionId: null,
		initialize: () => {
			const id = initSession();
			if (id) set({ sessionId: id });
		},
	}));
