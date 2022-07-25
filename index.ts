import * as ts from "typescript";
import { Generator } from "./src/Generator";
import { INamespace } from "./src/types/INamespace";
import { SchemaDownloader } from "./src/SchemaDownloader";
import { ObjectSchemaParser } from "./src/parsers/ObjectSchemaParser";
import { ResponseObjectParser } from "./src/parsers/ResponseSchemaParsers";
import { ErrorSchemaParser } from "./src/parsers/ErrorSignatureParser";

const generator = new Generator();
(async () => {
	await downloadSchema("objects");
	console.log("⟳ generating objects schema...");
	await generator.generate(
		"Objects.ts", 
		require("../objects.json"), 
		new ObjectSchemaParser()
	);
	const objectsNamespace: INamespace = {
		id: ts.factory.createIdentifier("Objects"),
		label: "objects",
		path: "./Objects.ts"
	};

	await downloadSchema("errors");
	console.log("⟳ generating errors schema...");
	await generator.generate(
		"Errors.ts", 
		require("../errors.json"), 
		new ErrorSchemaParser()
	);

	await downloadSchema("responses");
	console.log("⟳ generating responses schema...");
	await generator.generate(
		"Responses.ts", 
		require("../responses.json"), 
		new ResponseObjectParser([
			objectsNamespace
		])
	);

	console.log("✔ schemas have been created");
})().catch(e => {
	throw e;
});

async function downloadSchema(name) {
	let schemaDownloader = new SchemaDownloader(name);
	console.log(`⇩ downloading raw ${name} schema...`);
	await schemaDownloader.download(`${name}.json`);
	console.log(`✔ ${name} schema has been downloaded`);
}