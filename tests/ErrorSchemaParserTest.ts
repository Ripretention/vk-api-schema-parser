import * as ts from "typescript";
import { IErrorSchema } from "../src/types/jsonschema/ISchema";
import { ErrorSchemaParser } from "../src/parsers/ErrorSignatureParser";

const errorSchemaParser = new ErrorSchemaParser();
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
test("should return a subcodes schema", () => {
	let schema: IErrorSchema = {
		$schema: "",
		title: "",
		definitions: {
			some_subcode: {
				subcode: 213
			},
			some_subcode2: {
				subcode: 43
			}
		}, 
		errors: {}
	};

	const result = printer.printList(
		ts.ListFormat.MultiLine, 
		errorSchemaParser.parse(schema),
		undefined
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
		definitions: {}, 
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
		ts.ListFormat.MultiLine, 
		errorSchemaParser.parse(schema),
		undefined
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
	`.replace(/\s/g, ""));
});
test("should return a error with subcodes schema", () => {
	let schema: IErrorSchema = {
		$schema: "",
		title: "",
		definitions: {
			some_subcode: {
				subcode: 32
			},
			some_subcode2: {
				subcode: 64
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
		ts.ListFormat.MultiLine, 
		errorSchemaParser.parse(schema),
		undefined
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
	`.replace(/\s/g, ""));
});