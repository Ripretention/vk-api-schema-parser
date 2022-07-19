import * as ts from "typescript";
import { writeFile } from "fs/promises";
import type { ISchema } from "./types/jsonschema/ISchema";
import type { ISchemaParser } from "./types/ISchemaParser";

export class Generator {
	constructor(
		private readonly printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })
	) {}
	public generate(
		output: string,
		schema: ISchema,
		parser: ISchemaParser<any>
	) {
		let outputSourceFile = ts.createSourceFile(
			output, 
			"",
			ts.ScriptTarget.ES2022,
			false,
			ts.ScriptKind.TS
		);

		let parsedSchema = parser.parse(schema);
		let result = this.printer.printList(
			ts.ListFormat.MultiLine, 
			parsedSchema,
			outputSourceFile
		);
		
		return writeFile(output, result);
	}
}