import * as ts from "typescript";
import { IMethod } from "../src/types/jsonschema/IMethod";
import { MethodSignatureParser } from "../src/parsers/components/MethodSignatureParser";

const parser = new MethodSignatureParser();
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

test("should return a method with basic arguments and a primitive result", () => {
	let method: IMethod = {
		name: "some.name",
		parameters: [
			{
				name: "some_int",
				type: "number"
			},
			{
				name: "some_string",
				type: "string"
			}
		],
		responses: {
			response: {
				type: "number"
			}
		}
	};

	const result = printer.printNode(
		ts.EmitHint.Unspecified, 
		parser.parse("fn", method),
		undefined
	);

	expect(result.replace(/\s/g, "")).toBe(`
		public fn(params: {
			some_int: number;
			some_string: string;
		}): number;
	`.replace(/\s/g, ""));
});
test("should return a method with complex arguments and a complex result", () => {
	let method: IMethod = {
		name: "users.search",
		description: "some function",
		parameters: [
			{
				name: "count",
				type: "number",
				description: "number of users"
			},
			{
				name: "query",
				type: "string",
				description: "a query by which searching"
			},
			{
				name: "page_type",
				type: "string",
				enum: [
					"basic",
					"admin",
					"official_page",
					"moder",
					"helper"
				]
			},
			{
				name: "payload",
				type: "object",
				description: "payload",
				properties: {
					"field1": {
						"type": "string"
					},
					"field2": {
						type: "array",
						items: {
							type: "number"
						}
					}
				}
			}
		],
		responses: {
			only_count_response: {
				type: "number"
			},
			basic_response: {
				type: "object",
				properties: {
					count: {
						type: "number"
					},
					users: {
						type: "array",
						items: {
							type: "object",
							properties: {
								name: {
									type: "string"
								}
							}
						}
					}
				}
			}
		}
	};

	const result = printer.printNode(
		ts.EmitHint.Unspecified, 
		parser.parse("fn", method),
		undefined
	);

	expect(result.replace(/\s/g, "")).toBe(`
		/**
		 * some function
		 */
		public fn(params: {
			/**
			 * number of users
			 */
			count: number;
			/**
			 * a query by which searching
			 */
			query: string;
			page_type: "basic" | "admin" | "official_page" | "moder" | "helper";
			/**
			 * payload
			 */
			payload: {
				field1?: string;
				field2?: number[];
			};
		}): number | {
			count?: number;
			users?: {
				name?: string;
			}[];
		};
	`.replace(/\s/g, ""));
});