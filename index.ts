import { Generator } from "./src/Generator";
import { ObjectSchemaParser } from "./src/parsers/ObjectSchemaParser";
import { SchemaDownloader } from "./src/SchemaDownloader";

const schemaDownloader = new SchemaDownloader("objects");
const generator = new Generator();
(async () => {
	console.log("⇩ downloading raw objects schema...");
	await schemaDownloader.download("objects.json");
	console.log("✔ object schema has been downloaded");
	console.log("⟳ generating objects schema...");
	await generator.generate(
		"Objects.ts", 
		require("../objects.json"), 
		new ObjectSchemaParser()
	);

	console.log("✔ schemas have been created");
})().catch(e => {
	throw e;
});