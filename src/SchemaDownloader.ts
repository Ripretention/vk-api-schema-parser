import { Agent, get, RequestOptions } from "https";
import { createWriteStream } from "fs";

export class SchemaDownloader {
	constructor(private readonly schemaTitle: string) {}

	public async download(
		output = this.schemaTitle + ".ts",
		threadLabel = "master",
		optinos?: RequestOptions
	) {
		let outputStream = createWriteStream(output);

		return new Promise((resolve, reject) => {
			let req = get({
				hostname: "raw.githubusercontent.com",
				path: `VKCOM/vk-api-schema/${threadLabel}/${this.schemaTitle}.json`,
				agent: new Agent({ keepAlive: true }),
				timeout: 3e6,
				...(optinos ?? {})
			}, res => {
				res.pipe(outputStream);
				outputStream.on("close", () => {
					resolve(undefined);
				});
			});

			req.on("error", err => {
				outputStream.destroy();
				err.message = `Caught until downloading ${this.schemaTitle}.json to ${output}, ${err.message}`;
				reject(err);
			});

			req.end();
		});
	}
}