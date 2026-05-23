export const initSession = (): string => {
	if (typeof window === "undefined") return "";

	let storedId = localStorage.getItem(
		"chat_session_id",
	);

	if (!storedId) {
		storedId =
			crypto.randomUUID?.() ||
			"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
				/[xy]/g,
				(c) => {
					const r = (Math.random() * 16) | 0;
					return (
						c === "x" ? r : (r & 0x3) | 0x8
					).toString(16);
				},
			);

		localStorage.setItem(
			"chat_session_id",
			storedId,
		);
	}

	return storedId;
};
