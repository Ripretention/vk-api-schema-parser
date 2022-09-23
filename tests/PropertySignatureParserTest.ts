import { Printer } from "./helpers/Printer";
import { PropertyType } from "../src/types/jsonschema/PropertyType";
import { PropertySignatureParser } from "../src/parsers/components/PropertySignatureParser";
import { IArrayProperty, IEnumProperty, IObjectProperty, IProperty } from "../src/types/jsonschema/IProperty";

const parser = new PropertySignatureParser();
const printer = new Printer();

describe("primitive property test", () => {
	test("should return a string property", () => primitivePropTypeTest("string"));
	test("should return a boolean property", () => primitivePropTypeTest("boolean"));
	test("should return a number property", () => primitivePropTypeTest("number", false, true));
	test("should return a null property", () => primitivePropTypeTest("null", false, false, "undefined"));
	test("should return an integer property", () => primitivePropTypeTest("integer", true, false, "number"));
});
describe("enum property test", () => {
	test("should return an enum of strings", () => 
		enumPropTypeTest(
			"string", 
			false, 
			false, 
			["test", "long", "flow"]
		)
	);
	test("should return an enum of numbers", () => 
		enumPropTypeTest(
			"number", 
			false, 
			false, 
			[43, 2, 1, 43]
		)
	);
	test("should return an enum of any", () => 
		enumPropTypeTest(
			null, 
			false, 
			false, 
			[123, "number", 43, "test"]
		)
	);
});
describe("mixed property test", () => {
	test("should return an mixed property", () => 
		mixedPropTypeTest(
			["string", "number"]
		)
	);
	test("should return an mixed property", () => {
		let mixedProperty: IProperty<PropertyType[]> = {
			type: [
				"string", 
				"null", 
				"array", 
				["number", "boolean"]
			]
		};
	
		const result = printer.print(
			parser.parse("mixedProperty", mixedProperty)
		);

		expect(result.replace(/\s/g, "")).toBe(`
			mixedProperty: string | undefined | any[] | (number | boolean);
		`.replace(/\s/g, ""));
	});
});
describe("array property test", () => {
	test("should return a primitive array", () => {
		for (let type of ["string", "boolean", "number"] as PropertyType[]) {
			arrayPropTypeTest(type);
		}
	});
	test("should return an any array", () => {
		let array: IArrayProperty = {
			type: "array"
		};

		const result = printer.print(
			parser.parse("array", array)
		);

		expect(result.replace(/\s/g, "")).toBe(`
			array: any[];
		`.replace(/\s/g, ""));
	});
});
describe("tuple property test", () => {
	test("should return a primitive tuple", () => {
		let tupleProperty: IArrayProperty = {
			type: "array",
			prefixItems: [
				{
					type: "number"
				},
				{
					type: "string"
				}
			]
		};

		const result = printer.print(
			parser.parse("tuple", tupleProperty)
		);

		expect(result.replace(/\s/g, "")).toBe(`
			tuple: [number, string];
		`.replace(/\s/g, ""));
	});

	test("should return a mixed tuple", () => {
		let tupleProperty: IArrayProperty = {
			type: "array",
			prefixItems: [
				{
					type: "string"
				},
				{
					type: "array",
					items: {
						type: "string"
					}
				} as IArrayProperty,
				{
					type: "number",
					enum: [
						2, 
						3, 
						4
					]
				} as IEnumProperty<"number">,
				{
					type: ["string", "boolean"]
				}
			]
		};

		const result = printer.print(
			parser.parse("tuple", tupleProperty)
		);

		expect(result.replace(/\s/g, "")).toBe(`
			tuple: [string, string[], 2 | 3 | 4, string | boolean];
		`.replace(/\s/g, ""));
	});
});
describe("object property test", () => {
	test("should return a object with a primitive properties", () => {
		let tupleProperty: IObjectProperty = {
			type: "object",
			properties: {
				prop1: {
					type: "string",
					required: true
				},
				prop2: {
					type: "number",
					required: false
				},
				prop3: {
					type: "boolean"
				}
			}
		};

		const result = printer.print(
			parser.parse("object", tupleProperty)
		);

		expect(result.replace(/\s/g, "")).toBe(`
			object: {
				prop1: string;
				prop2?: number;
				prop3?: boolean;
			};
		`.replace(/\s/g, ""));
	});

	test("should return a object with a complex properties", () => {
		let tupleProperty: IObjectProperty = {
			type: "object",
			properties: {
				tupleProp: {
					type: "array",
					prefixItems: [
						{
							type: "string"
						},
						{
							type: "number"
						}
					]
				},
				enumProp: {
					type: "string",
					enum: [
						"long",
						"big",
						"clear",
						"sky"
					]
				},
				arrayProp: {
					type: "array",
					items: {
						type: "boolean"
					}
				},
				mixedProp: {
					type: ["number", "string", "boolean"]
				},
				objectProp: {
					type: "object",
					properties: {
						field: {
							type: "array",
							items: {
								type: ["number", "string"]
							},
							description: "what is it!?"
						}
					}
				}
			},
			required: ["enumProp", "mixedProp"]
		};

		const result = printer.print(
			parser.parse("object", tupleProperty)
		);

		expect(result.replace(/\s/g, "")).toBe(`
			object: {
				tupleProp?: [string, number];
				enumProp: "long" | "big" | "clear" | "sky";
				arrayProp?: boolean[];
				mixedProp: number | string | boolean;
				objectProp?: {
					/**
					* what is it!?
					*/
					field?: (number | string)[];
				};
			};
		`.replace(/\s/g, ""));
	});
});
describe("union property test", () => {
	test("should return a primitive union (allOf)", () => {
		let allOfProp: IProperty<any> = {
			type: undefined,
			allOf: [
				{
					type: "string"
				},
				{
					type: "number"
				}
			]
		};
	
		const result = printer.print(
			parser.parse("allOf", allOfProp)
		);
	
		expect(result.replace(/\s/g, "")).toBe(`
			allOf: string & number;
		`.replace(/\s/g, ""));
	});
	test("should return a primitive union (anyOf)", () => {
		let anyOfProp: IProperty<any> = {
			type: undefined,
			anyOf: [
				{
					type: "boolean"
				},
				{
					type: ["number", "string"]
				}
			]
		};
	
		const result = printer.print( 
			parser.parse("anyOf", anyOfProp)
		);
	
		expect(result.replace(/\s/g, "")).toBe(`
			anyOf: boolean | (number | string);
		`.replace(/\s/g, ""));
	});

	test("should return a complex union (allOf)", () => {
		let allOfProp: IProperty<any> = {
			type: undefined,
			allOf: [
				{
					type: "array",
					items: {
						type: "string"
					}
				} as IArrayProperty,
				{
					type: "array",
					prefixItems: [
						{
							type: "boolean"
						},
						{
							type: ["number", "string"]
						}
					]
				} as IArrayProperty,
				{
					type: "object",
					properties: {
						fF: {
							type: "string"
						},
						sF: {
							type: "integer"
						}
					}
				} as IObjectProperty
			]
		};
	
		const result = printer.print(
			parser.parse("allOf", allOfProp)
		);
	
		expect(result.replace(/\s/g, "")).toBe(`
			allOf: 
				string[] & 
				[boolean, number | string] & 
				{ 
					fF?: string; 
					sF?: number; 
				};
		`.replace(/\s/g, ""));
	});
	test("should return a primitive union (oneOf)", () => {
		let oneOfProp: IProperty<any> = {
			type: undefined,
			oneOf: [
				{
					type: "object",
					properties: {
						f: {
							type: "string",
							description: "some field"
						}
					}
				} as IObjectProperty,
				{
					type: ["string", "number"],
					enum: [
						"qwe",
						321
					]
				} as IEnumProperty<["string", "number"]>
			]
		};
	
		const result = printer.print(
			parser.parse("oneOf", oneOfProp)
		);
	
		expect(result.replace(/\s/g, "")).toBe(`
			oneOf: {
				/**
				* some field
				*/
				f?: string;
			} | ("qwe" | 321);
		`.replace(/\s/g, ""));
	});
	
});

function primitivePropTypeTest(
	type: PropertyType, 
	isReadonly = false, 
	isOptional = false, 
	expectedType = type as string
) {
	let prop: IProperty<typeof type> = {
		type: type,
		description: `super ${type}`
	};

	const result = printer.print(
		parser.parse("test", prop, isReadonly, isOptional)
	);
	
	expect(result.replace(/\s/g, "")).toBe(`
		/*** super ${type} */
		${isReadonly ? "readonly " : ""}test${isOptional ? "?:" : ":"} ${expectedType};
	`.replace(/\s/g, ""));
}
function enumPropTypeTest<VType>(
	type: PropertyType, 
	isReadonly = false, 
	isOptional = false, 
	values: VType[]
) {
	let prop: IEnumProperty<typeof type> = {
		type: type,
		enum: values
	};

	const result = printer.print(
		parser.parse("test", prop, isReadonly, isOptional)
	);

	expect(result.replace(/\s/g, "")).toBe(`
		${isReadonly ? "readonly " : ""}test${isOptional ? "?:" : ":"} ${values.map(v => typeof v === "string" ? `"${v}"` : v).join("|")};
	`.replace(/\s/g, ""));
}
function mixedPropTypeTest(
	type: PropertyType[], 
	isReadonly = false, 
	isOptional = false
) {
	let prop: IProperty<typeof type> = {
		type: type
	};

	const result = printer.print(
		parser.parse("test", prop, isReadonly, isOptional)
	);

	expect(result.replace(/\s/g, "")).toBe(`
		${isReadonly ? "readonly " : ""}test${isOptional ? "?:" : ":"} ${type.join("|")};
	`.replace(/\s/g, ""));
}
function arrayPropTypeTest(
	type: PropertyType, 
	isReadonly = false, 
	isOptional = false, 
	expectedType = type as string
) {
	let prop: IArrayProperty = {
		type: "array",
		items: {
			type
		}
	};

	const result = printer.print(
		parser.parse("test", prop, isReadonly, isOptional)
	);

	expect(result.replace(/\s/g, "")).toBe(`
		${isReadonly ? "readonly " : ""}test${isOptional ? "?:" : ":"} ${expectedType}[];
	`.replace(/\s/g, ""));
}
