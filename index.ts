import * as ts from "typescript";
import { unlink } from "fs/promises";
import { Generator } from "./src/Generator";
import { toUpperFirstChar } from "./src/Utils";
import { SchemaDownloader } from "./src/SchemaDownloader";
import { BaseSchemaParser } from "./src/parsers/BaseSchemaParser";
import { ErrorSchemaParser } from "./src/parsers/ErrorSchemaParser";
import { ObjectSchemaParser } from "./src/parsers/ObjectSchemaParser";
import { MethodSchemaParser } from "./src/parsers/MethodSchemaParser";
import { ResponseObjectParser } from "./src/parsers/ResponseSchemaParser";

const generator = new Generator();
const outputDir = process.argv?.[2] ?? "./vkschema";
const isAutoCleanUpActivated = process.argv
	.slice(2, process.argv.length)
	.some(arg => arg === "-c");

async function genenrate(schemaName: string, parser: BaseSchemaParser<any>) {
	let schemaDownloader = new SchemaDownloader(schemaName);
	console.log(`⇩ downloading raw ${schemaName} schema...`);
	await schemaDownloader.download(`${outputDir}/${schemaName}.json`);
	console.log(`✔ ${schemaName} schema has been downloaded`);

	console.log(`⟳ generating ${schemaName} schema...`);
	await generator.generate(
		`${outputDir}/${toUpperFirstChar(schemaName)}.ts`, 
		require(`.${outputDir}/${schemaName}.json`), 
		parser
	);
	
	if (isAutoCleanUpActivated)
		await unlink(`${outputDir}/${schemaName}.json`);

	console.log("\n");
	return {
		id: ts.factory.createIdentifier(toUpperFirstChar(schemaName)),
		label: schemaName,
		path: `./${toUpperFirstChar(schemaName)}.ts`
	};
}
(async () => {
	let objectsNamespace = await genenrate("objects", new ObjectSchemaParser());
	let errorsNamespace = await genenrate("errors", new ErrorSchemaParser());
	let responsesNamespace = await genenrate(
		"responses", 
		new ResponseObjectParser([
			objectsNamespace
		])
	);
	
	await genenrate(
		"methods", 
		new MethodSchemaParser([
			errorsNamespace,
			objectsNamespace,
			responsesNamespace
		])
	);

	console.log("✔ schemas have been created");
})().catch(e => {
	throw e;
});