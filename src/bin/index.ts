#! /usr/bin/env node

import { prompt } from "inquirer";
import { sep } from "path";
import {
	editorconfig,
	eslint,
	git,
	prettier,
	stylelint,
	vscode
} from "./configurations";
import type { Package } from "./Package";
import {
	cwdPackagePath,
	cwdPath,
	vangstylePackagePath,
	vangstylePath
} from "./paths";
import { readFilePromise } from "./readFilePromise";
import { updateJSONPromise } from "./updateJSONPromise";

const configurations = {
	ESLint: eslint,
	EditorConfig: editorconfig,
	Git: git,
	Prettier: prettier,
	"Visual Studio Code": vscode,
	stylelint
};

// TODO: Maybe make this less lengthy
export default new Promise((resolveValidDirectory, rejectValidDirectory) =>
	cwdPath !== vangstylePath
		? resolveValidDirectory()
		: rejectValidDirectory(
				"This script shouldn't be run in vangstyle's directory"
		  )
)
	.then(_ =>
		prompt<{ readonly action: string }>([
			{
				choices: [
					{
						name: "Add dependencies to package.json",
						value: "addDependencies"
					},
					{
						name: "Copy configuration files",
						value: "copyConfigurations"
					}
				],
				message: "Which action do you want to perform?",
				name: "action",
				type: "list"
			}
		])
	)
	.then(({ action }) =>
		({
			// eslint-disable-next-line functional/functional-parameters
			addDependencies: () =>
				readFilePromise(vangstylePackagePath, "utf8")
					.then(JSON.parse)
					.then((vangstylePackage: Package) =>
						updateJSONPromise<Package>(currentPackage => ({
							...currentPackage,
							devDependencies: {
								...(currentPackage.devDependencies ?? {}),
								...vangstylePackage.peerDependencies
							}
						}))(cwdPackagePath).then(_ => [
							"Package updated. Run install!"
						])
					),
			// eslint-disable-next-line functional/functional-parameters
			copyConfigurations: () =>
				prompt<{
					readonly selected: readonly (keyof typeof configurations)[];
				}>([
					{
						choices: Object.keys(configurations),
						message: "Which configurations should be copied?",
						name: "selected",
						type: "checkbox"
					}
				])
					.then(({ selected = [] }) =>
						Promise.all(
							selected.map(configuration =>
								configurations[configuration](cwdPath)
							)
						)
					)
					.then((copiedData = []) =>
						copiedData
							.flatMap(fileData => fileData)
							.map(
								({ target }) =>
									`${target.replace(
										`${cwdPath}${sep}`,
										""
									)} installed!`
							)
					)
		}[action]())
	)
	.then((messages: readonly string[]) =>
		messages.map(message => console.log(message))
	)
	.catch(console.error);