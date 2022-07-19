import { Generator } from "./src/Generator";
import { ObjectSchemaParser } from "./src/parsers/ObjectSchemaParser";

const generator = new Generator();
(async () => {
	console.log("creating objects schema...");
	await generator.generate(
		"Objects.ts", 
		require("../objects.json"), 
		new ObjectSchemaParser()
	);

	console.log("schemas has been created");
})().catch(e => {
	throw e;
});
