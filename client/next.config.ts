import type { NextConfig } from "next"

const backendUrl = process.env.BACKEND_URL || "http://localhost:3000",
 publicBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || backendUrl

const isDevelopment = process.env.NODE_ENV !== "production"

const getOrigin = (url: string): string | null => {
	try {
		return new URL(url).origin
	} catch {
		return null
	}
}

const getWebSocketOrigin = (url: string): string | null => {
	try {
		const parsedUrl = new URL(url)
		parsedUrl.protocol = parsedUrl.protocol === "https:" ? "wss:" : "ws:"

		return parsedUrl.origin
	} catch {
		return null
	}
}

const backendOrigin = getOrigin(publicBackendUrl),
 backendWebSocketOrigin = getWebSocketOrigin(publicBackendUrl)

const connectSrc = [
	"'self'",
	backendOrigin,
	backendWebSocketOrigin,
	isDevelopment ? "http://localhost:*" : null,
	isDevelopment ? "http://127.0.0.1:*" : null,
	isDevelopment ? "ws://localhost:*" : null,
	isDevelopment ? "ws://127.0.0.1:*" : null,
]
	.filter(Boolean)
	.join(" ")

const contentSecurityPolicy = [
	"default-src 'self'",
	`script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' data: blob: https:",
	"font-src 'self' data:",
	`connect-src ${connectSrc}`,
	"media-src 'self' blob:",
	"object-src 'none'",
	"base-uri 'self'",
	"form-action 'self'",
	"frame-ancestors 'none'",
	"frame-src 'none'",
	"manifest-src 'self'",
	"worker-src 'self' blob:",
	isDevelopment ? null : "upgrade-insecure-requests",
]
	.filter(Boolean)
	.join("; ")

const securityHeaders = [
	{
		key: "Content-Security-Policy",
		value: contentSecurityPolicy,
	},
	{
		key: "X-Content-Type-Options",
		value: "nosniff",
	},
	{
		key: "Referrer-Policy",
		value: "strict-origin-when-cross-origin",
	},
	{
		key: "X-Frame-Options",
		value: "DENY",
	},
	{
		key: "Permissions-Policy",
		value:
			"camera=(), microphone=(), geolocation=(), payment=(), usb=(), fullscreen=(self)",
	},
]

const nextConfig: NextConfig = {
	output: 'standalone',
	env: {
		NEXT_PUBLIC_BACKEND_URL: publicBackendUrl,
	},
	images: {
		qualities: [70],
	},

	reactStrictMode: true,

	async rewrites() {
		return [
			{
				source: "/api/:path*",
				destination: `${backendUrl}/api/:path*`,
			},
		]
	},

	async headers() {
		return [
			{
				source: "/(.*)",
				headers: securityHeaders,
			},
		]
	},
}

export default nextConfig