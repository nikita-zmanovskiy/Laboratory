import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import featureSliced from "@conarti/eslint-plugin-feature-sliced";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const eslintConfig = [
	{
		ignores: [
			".next/**",
			"node_modules/**",
			"dist/**",
			"build/**",
			"coverage/**",
			"**/legacy/**",
			"next-env.d.ts",
		],
	},

	...compat.extends("next/core-web-vitals", "next/typescript"),

	{
		files: ["**/*.{js,jsx,ts,tsx}"],
		plugins: {
			"simple-import-sort": simpleImportSort,
		},
		rules: {
			"simple-import-sort/imports": [
				"warn",
				{
					groups: [
						["^react$", "^next", "^@?\\w"],
						["^@/app(/.*|$)"],
						["^@/pages(/.*|$)"],
						["^@/widgets(/.*|$)"],
						["^@/features(/.*|$)"],
						["^@/entities(/.*|$)"],
						["^@/shared(/.*|$)"],
						["^@/"],
						["^\\u0000"],
						["^\\.\\.(?!/?$)", "^\\.\\./?$"],
						["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
						["^.+\\.module\\.(css|scss)$"],
						["^.+\\.(css|scss)$"],
					],
				},
			],
			"simple-import-sort/exports": "warn",
		},
	},

	{
		files: ["src/**/*.{ts,tsx}"],
		plugins: {
			"@conarti/feature-sliced": featureSliced,
		},
		rules: {
			"@conarti/feature-sliced/layers-slices": "warn",
			"@conarti/feature-sliced/absolute-relative": "warn",
			"@conarti/feature-sliced/public-api": "warn",
		},
	},

	{
		rules: {
			"@typescript-eslint/no-unused-vars": "warn",
			"@typescript-eslint/no-explicit-any": "warn",
		},
	},
];

export default eslintConfig;
