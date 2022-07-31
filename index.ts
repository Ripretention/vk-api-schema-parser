import * as ts from "typescript";
import { Generator } from "./src/Generator";
import { INamespace } from "./src/types/INamespace";
import { SchemaDownloader } from "./src/SchemaDownloader";
import { ErrorSchemaParser } from "./src/parsers/ErrorSchemaParser";
import { ObjectSchemaParser } from "./src/parsers/ObjectSchemaParser";
import { MethodSchemaParser } from "./src/parsers/MethodSchemaParser";
import { ResponseObjectParser } from "./src/parsers/ResponseSchemaParser";

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
	const errorsNamespace: INamespace = {
		id: ts.factory.createIdentifier("Errors"),
		label: "errors",
		path: "./Errors.ts"
	};

	await downloadSchema("responses");
	console.log("⟳ generating responses schema...");
	await generator.generate(
		"Responses.ts", 
		require("../responses.json"), 
		new ResponseObjectParser([
			objectsNamespace
		])
	);
	const responsesNamespace: INamespace = {
		id: ts.factory.createIdentifier("Responses"),
		label: "responses",
		path: "./Responses.ts"
	};

	await downloadSchema("methods");
	console.log("⟳ generating methods schema...");
	await generator.generate(
		"Methods.ts", 
		require("../methods.json"), 
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

async function downloadSchema(name) {
	let schemaDownloader = new SchemaDownloader(name);
	console.log(`⇩ downloading raw ${name} schema...`);
	await schemaDownloader.download(`${name}.json`);
	console.log(`✔ ${name} schema has been downloaded`);
}