import { readFile } from "fs/promises";
import { resolve } from "path";
import { copyFilesRecursivePromise } from "./copyFilesRecursivePromise";
import { Package } from "./Package";
import {
	basePackagePath,
	basePath,
	cwdPackagePath,
	resolveConfigurationsPath
} from "./paths";
import { updateJSONPromise } from "./updateJSONPromise";

export type Configuration = (
	targetDirectory: string
) => Promise<readonly { readonly source: string; readonly target: string }[]>;

export const addDevDependencies = (packages: readonly string[]) =>
	readFile(basePackagePath, "utf8")
		.then(JSON.parse)
		.then(({ devDependencies }: Package) =>
			updateJSONPromise<Package>(targetPackage => ({
				...targetPackage,
				devDependencies: {
					...(targetPackage.devDependencies ?? {}),
					...Object.fromEntries(
						Object.entries(
							devDependencies
						).filter(([packageName]) =>
							packages.includes(packageName)
						)
					)
				}
			}))(cwdPackagePath)
		);

export const editorconfig: Configuration = targetDirectory =>
	copyFilesRecursivePromise([resolveConfigurationsPath(".editorconfig")])([
		resolve(targetDirectory, ".editorconfig")
	]);

export const linting: Configuration = targetDirectory =>
	addDevDependencies([
		"@types/eslint",
		"@types/node",
		"@types/prettier",
		"@typescript-eslint/eslint-plugin",
		"@typescript-eslint/parser",
		"eslint-config-prettier",
		"eslint-import-resolver-node",
		"eslint-plugin-ban",
		"eslint-plugin-functional",
		"eslint-plugin-import",
		"eslint-plugin-no-null",
		"eslint-plugin-prefer-arrow",
		"eslint-plugin-prettier",
		"eslint",
		"prettier",
		"typescript"
	]).then(_ =>
		copyFilesRecursivePromise([
			resolveConfigurationsPath("tsconfig.json"),
			resolveConfigurationsPath(".eslintrc.js"),
			resolveConfigurationsPath(".prettierignore"),
			resolveConfigurationsPath(".prettierrc.js")
		])([
			resolve(targetDirectory, "tsconfig.json"),
			resolve(targetDirectory, ".eslintrc.js"),
			resolve(targetDirectory, ".prettierignore"),
			resolve(targetDirectory, ".prettierrc.js")
		])
	);

export const git: Configuration = targetDirectory =>
	copyFilesRecursivePromise([resolveConfigurationsPath(".gitignore")])([
		resolve(targetDirectory, ".gitignore")
	]);

export const css: Configuration = targetDirectory =>
	addDevDependencies([
		"@types/prettier",
		"@types/stylelint",
		"prettier",
		"stylelint",
		"stylelint-config-prettier",
		"stylelint-order",
		"stylelint-prettier"
	]).then(_ =>
		copyFilesRecursivePromise([
			resolveConfigurationsPath(".stylelintrc.js"),
			resolveConfigurationsPath(".prettierignore"),
			resolveConfigurationsPath(".prettierrc.js")
		])([
			resolve(targetDirectory, ".stylelintrc.js"),
			resolve(targetDirectory, ".prettierignore"),
			resolve(targetDirectory, ".prettierrc.js")
		])
	);

export const vscode: Configuration = targetDirectory =>
	copyFilesRecursivePromise([resolve(basePath, ".vscode/settings.json")])([
		resolve(targetDirectory, ".vscode/settings.json")
	]);
