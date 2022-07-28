import * as ts from "typescript";
import { IMethod } from "../src/types/jsonschema/IMethod";
import { MethodCategoryParser } from "../src/parsers/components/MethodCategoryParser";

const parser = new MethodCategoryParser();
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

test("should return a users category", () => {
	let methods: IMethod[] = [
		{
			name: "users.get",
			parameters: [
				{
					name: "count",
					type: "number"
				},
				{
					name: "fields",
					type: "string",
					enum: [
						"first_name",
						"last_name"
					]
				}
			],
			responses: {
				response: {
					type: "object",
					properties: {
						first_name: {
							type: "string"
						},
						last_name: {
							type: "string"
						}
					}
				}
			}
		}, 
		{
			name: "users.find",
			parameters: [
				{
					name: "first_name",
					type: "string"
				},
				{
					name: "last_name",
					type: "string"
				}
			],
			responses: {
				response: {
					type: "object",
					properties: {
						user_id: {
							type: "number"
						}
					}
				}
			}
		}
	];

	const result = printer.printNode(
		ts.EmitHint.Unspecified, 
		parser.parse("users", methods),
		undefined
	);

	expect(result.replace(/\s/g, "")).toBe(`
		class Users {
			public get(params: {
				count: number;
				fields: "first_name" | "last_name";
			}): {
				first_name?: string;
				last_name?: string;
			};

			public find(params: {
				first_name: string;
				last_name: string;
			}): {
				user_id?: number;
			};

			constructor(private readonly callMethod: (methodName: string, params: object) => any) {}
		}
	`.replace(/\s/g, ""));
	
});