import { Printer } from "./helpers/Printer";
import { IMethod } from "../src/types/jsonschema/IMethod";
import { MethodCategoryParser } from "../src/parsers/components/MethodCategoryParser";

const parser = new MethodCategoryParser();
const printer = new Printer();

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

	const result = printer.print(
		parser.parse("users", methods)
	);

	expect(result.replace(/\s/g, "")).toBe(`
		export class Users {
			public get(params: {
				count: number;
				fields: "first_name" | "last_name";
			}): Promise<{
				first_name?: string;
				last_name?: string;
			}> {
				return this.callMethod("users.get", params as object);
			}

			public find(params: {
				first_name: string;
				last_name: string;
			}): Promise<{
				user_id?: number;
			}> {
				return this.callMethod("users.find", params as object);
			}

			constructor(private readonly callMethod: (methodName: string, params: object) => Promise<any>) {}
		}
	`.replace(/\s/g, ""));
	
});