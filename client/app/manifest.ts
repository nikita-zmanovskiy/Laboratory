import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Промт-инженер | Лаборатория ИИ",
		short_name: "Лаборатория",
		description:
			"Интерактивный учебный веб-сервис для практического освоения навыков промпт-инжиниринга",
		start_url: "/",
		display: "standalone",
		orientation: "portrait",
		background_color: "#08090c",
		theme_color: "#08090c",
		icons: [
			{
				src: "/icons/icon-192.webp",
				sizes: "192x192",
				type: "image/webp",
			},
			{
				src: "/icons/icon-512.webp",
				sizes: "512x512",
				type: "image/webp",
			},
		],
	}
}
