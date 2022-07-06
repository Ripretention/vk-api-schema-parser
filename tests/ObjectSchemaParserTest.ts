import * as ts from "typescript";
import { ISchema } from "../src/types/jsonschema/ISchema";
import { IObjectProperty } from "../src/types/jsonschema/IProperty";
import { ObjectSchemaParser } from "../src/parsers/ObjectSchemaParser";

const objectSchemaParser = new ObjectSchemaParser();
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
test("should return a primitive interface-based schema", () => {
	let schema: ISchema = {
		$schema: "https://json.com",
		title: "obj",
		definitions: {
			fst_entity: {
				type: "object",
				description: "some description for first entity",
				properties: {
					field: {
						type: "number"
					}
				}
			} as IObjectProperty,
			snd_entity: {
				type: "object",
				description: "some description for second entity",
				properties: {
					field: {
						type: "string",
						description: "a very important field"
					}
				}
			} as IObjectProperty
		}
	};

	const result = printer.printList(
		ts.ListFormat.MultiLine, 
		objectSchemaParser.parse(schema),
		undefined
	);

	expect(result.replace(/\s/g, "")).toBe(`
		/**
		*	some description for first entity
		*/	
		interface IFstEntity {
			field: number;
		}
		/**
		* some description for second entity
		*/
		interface ISndEntity {
			/**
			* a very important field
			*/
			field: string;
		}
	`.replace(/\s/g, ""));
});