export const isValidBase64Image = (
	base64String: string | null,
): boolean => {
	if (
		!base64String ||
		typeof base64String !== "string"
	)
		return false;

	const cleanBase64 = base64String.includes(",")
		? base64String.split(",")[1]
		: base64String;

	if (cleanBase64.length < 100) return false;
	const base64Regex =
		/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

	return base64Regex.test(cleanBase64);
};
