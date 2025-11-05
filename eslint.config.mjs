import obsidianmd from "eslint-plugin-obsidianmd";
import tseslint from "typescript-eslint";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default tseslint.config(
	...tseslint.configs.recommended,
	...obsidianmd.configs.recommended,
	{
		languageOptions: {
			parserOptions: {
				project: "./tsconfig.json",
				tsconfigRootDir: __dirname
			},
			globals: {
				document: "readonly",
				console: "readonly",
				getComputedStyle: "readonly",
				window: "readonly",
				HTMLElement: "readonly",
				SVGElement: "readonly",
				Element: "readonly",
				Node: "readonly"
			}
		},
		rules: {
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/no-unused-vars": ["warn", {
				"args": "all",
				"argsIgnorePattern": "^_"
			}]
		}
	}
);

