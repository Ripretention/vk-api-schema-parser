import { Printer } from "./helpers/Printer";
import { IErrorSchema } from "../src/types/jsonschema/ISchema";
import { ErrorSchemaParser } from "../src/parsers/ErrorSchemaParser";

const printer = new Printer();
const errorSchemaParser = new ErrorSchemaParser();
test("should return a subcodes schema", () => {
	let schema: IErrorSchema = {
		$schema: "",
		title: "",
		definitions: {
			subcodes: {
				some_subcode: {
					subcode: 213
				},
				some_subcode2: {
					subcode: 43
				}
			}
		}, 
		errors: {}
	};
	
	const result = printer.printList(
		errorSchemaParser.parse(schema)
	);

	expect(result.replace(/\s/g, "")).toBe(`
		export type SomeSubcode = 213;
		export type SomeSubcode2 = 43;
	`.replace(/\s/g, ""));
});
test("should return a error schema", () => {
	let schema: IErrorSchema = {
		$schema: "",
		title: "",
		definitions: {
			subcodes: {}
		}, 
		errors: {
			some_error: {
				code: 1,
				global: true,
			},
			some_error2: {
				code: 2,
				description: "some desc"
			}
		}
	};

	const result = printer.printList( 
		errorSchemaParser.parse(schema)
	);

	expect(result.replace(/\s/g, "")).toBe(`
		export interface SomeError {
			code: 1;
			global: true;
		}
		/**
		 * some desc
		*/
		export interface SomeError2 {
			code: 2;
		}
		export type VkGlobalError = SomeError;
	`.replace(/\s/g, ""));
});
test("should return a error with subcodes schema", () => {
	let schema: IErrorSchema = {
		$schema: "",
		title: "",
		definitions: {
			subcodes: {
				some_subcode: {
					subcode: 32
				},
				some_subcode2: {
					subcode: 64
				}
			}
		}, 
		errors: {
			some_error: {
				code: 1,
				global: true,
				subcodes: [
					{
						subcode: undefined,
						$ref: "#/definitions/some_subcode"
					},
					{
						subcode: undefined,
						$ref: "#/definitions/some_subcode2"
					}, 
				],
				description: "some desc"
			}
		}
	};

	const result = printer.printList(
		errorSchemaParser.parse(schema)
	);

	expect(result.replace(/\s/g, "")).toBe(`
		export type SomeSubcode = 32;
		export type SomeSubcode2 = 64;
		/**
		 * some desc
		*/
		export interface SomeError {
			code: 1 | SomeSubcode | SomeSubcode2;
			global: true;
		}
		export type VkGlobalError = SomeError;
	`.replace(/\s/g, ""));
});
