import * as ts from "typescript";
import { unlink } from "fs/promises";
import { Generator } from "./src/Generator";
import { toUpperFirstChar } from "./src/Utils";
import { SchemaDownloader } from "./src/SchemaDownloader";
import { 
	BaseSchemaParser,
	ErrorSchemaParser,
	ObjectSchemaParser,
	MethodSchemaParser,
	ResponseObjectParser
} from "./src/parsers";

export default class VkApiSchemaParser {
	private readonly generator = new Generator();
	constructor(
		private readonly logger: (message: string) => any
	) {}

	public async parse(outputDir = "./vkschema", autoCleanUp = false) {
		let objectsNamespace = await this.parseSchema(
			"objects", 
			new ObjectSchemaParser(),
			outputDir,
			autoCleanUp,
		);
		let errorsNamespace = await this.parseSchema(
			"errors", 
			new ErrorSchemaParser(),
			outputDir,
			autoCleanUp
		);
		let responsesNamespace = await this.parseSchema(
			"responses", 
			new ResponseObjectParser([
				objectsNamespace
			]),
			outputDir,
			autoCleanUp,
		);
		
		await this.parseSchema(
			"methods", 
			new MethodSchemaParser([
				errorsNamespace,
				objectsNamespace,
				responsesNamespace
			]), 
			outputDir,
			autoCleanUp,
		);

		this?.logger("✔ schemas have been created");
	}
	private async parseSchema( 
		schemaName: string,
		parser: BaseSchemaParser<any>,
		outputDir: string, 
		autoCleanUp: boolean
	) {
		let schemaDownloader = new SchemaDownloader(schemaName);
		this?.logger(`⇩ downloading raw ${schemaName} schema...`);
		await schemaDownloader.download(`${outputDir}/${schemaName}.json`);
		this?.logger(`✔ ${schemaName} schema has been downloaded`);

		this?.logger(`⟳ generating ${schemaName} schema...`);
		await this.generator.generate(
			`${outputDir}/${toUpperFirstChar(schemaName)}.ts`, 
			require(`.${outputDir}/${schemaName}.json`), 
			parser
		);
		
		if (autoCleanUp)
			await unlink(`${outputDir}/${schemaName}.json`);

		this?.logger("\n");
		return {
			id: ts.factory.createIdentifier(toUpperFirstChar(schemaName)),
			label: schemaName,
			path: `./${toUpperFirstChar(schemaName)}.ts`
		};
	}
}