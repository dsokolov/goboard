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
			// TypeScript rules
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/no-unused-vars": ["warn", {
				"args": "all",
				"argsIgnorePattern": "^_"
			}],
			// Require await in async functions
			"@typescript-eslint/require-await": "error",
			// Unsafe assignments
			"@typescript-eslint/no-unsafe-assignment": "error",
			"@typescript-eslint/no-unsafe-call": "error",
			"@typescript-eslint/no-unsafe-member-access": "error",
			"@typescript-eslint/no-unsafe-return": "error",
			// Obsidian-specific rules - ensure they are enabled
			"obsidianmd/platform": "error",
			"obsidianmd/no-static-styles-assignment": "error",
			"obsidianmd/settings-tab/no-manual-html-headings": "error",
			"obsidianmd/settings-tab/no-problematic-settings-headings": "error",
			"obsidianmd/ui/sentence-case": "error",
			// Security: prevent innerHTML/outerHTML usage
			"no-restricted-properties": ["error", {
				"object": "document",
				"property": "innerHTML",
				"message": "Using innerHTML is a security risk. Use DOM API or Obsidian helper functions instead."
			}, {
				"object": "document",
				"property": "outerHTML",
				"message": "Using outerHTML is a security risk. Use DOM API or Obsidian helper functions instead."
			}, {
				"object": "Element",
				"property": "innerHTML",
				"message": "Using innerHTML is a security risk. Use DOM API or Obsidian helper functions instead."
			}, {
				"object": "Element",
				"property": "outerHTML",
				"message": "Using outerHTML is a security risk. Use DOM API or Obsidian helper functions instead."
			}, {
				"object": "HTMLElement",
				"property": "innerHTML",
				"message": "Using innerHTML is a security risk. Use DOM API or Obsidian helper functions instead."
			}, {
				"object": "HTMLElement",
				"property": "outerHTML",
				"message": "Using outerHTML is a security risk. Use DOM API or Obsidian helper functions instead."
			}],
			"no-restricted-syntax": ["error", {
				"selector": "MemberExpression[object.name='document'][property.name='insertAdjacentHTML']",
				"message": "Using insertAdjacentHTML is a security risk. Use DOM API or Obsidian helper functions instead."
			}, {
				"selector": "MemberExpression[object.type='Identifier'][property.name='insertAdjacentHTML']",
				"message": "Using insertAdjacentHTML is a security risk. Use DOM API or Obsidian helper functions instead."
			}]
		}
	}
);

