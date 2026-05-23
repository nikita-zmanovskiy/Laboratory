import simpleImportSort from "eslint-plugin-simple-import-sort";
import tsParser from "@typescript-eslint/parser";

export default [
	{
		ignores: [
			".next/**",
			"node_modules/**",
			"dist/**",
			"build/**",
			"coverage/**",
			"**/legacy/**",
		],
	},
	{
		files: ["**/*.{js,jsx,ts,tsx}"],
		languageOptions: {
			parser: tsParser,
			ecmaVersion: "latest",
			sourceType: "module",
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
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
];
