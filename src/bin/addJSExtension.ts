import { readFilePromise } from "./readFilePromise";
import { writeFilePromise } from "./writeFilePromise";

/** Adds .js extension in imports and exports of given filename. */
export const addJSExtension = (filename: string) =>
	readFilePromise(filename, "utf8").then(data =>
		data.match(/(?:import|export)\s+.*\s+from/gu)
			? writeFilePromise(
					filename,
					data.replace(
						/(?<prepend>(?:import|export)\s+.*\s+from\s+")(?<path>.*)(?=")/gu,
						"$1$2.js"
					)
			  ).then(_ => console.log(`${filename} prettified!`))
			: Promise.resolve()
	);
