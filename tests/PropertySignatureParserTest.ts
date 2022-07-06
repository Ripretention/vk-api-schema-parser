import * as ts from "typescript";
import { PropertyType } from "../src/types/jsonschema/PropertyType";
import { PropertySignatureParser } from "../src/parsers/PropertySignatureParser";
import { TypeMetadataResolver } from "../src/parsers/helpers/TypeMetadataResolver";
import { IArrayProperty, IEnumProperty, IObjectProperty, IProperty } from "../src/types/jsonschema/IProperty";

const parser = new PropertySignatureParser(new TypeMetadataResolver());
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

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
	
		const result = printer.printNode(
			ts.EmitHint.Unspecified, 
			parser.parse("mixedProperty", mixedProperty),
			undefined
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

		const result = printer.printNode(
			ts.EmitHint.Unspecified, 
			parser.parse("array", array),
			undefined
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

		const result = printer.printNode(
			ts.EmitHint.Unspecified, 
			parser.parse("tuple", tupleProperty),
			undefined
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

		const result = printer.printNode(
			ts.EmitHint.Unspecified, 
			parser.parse("tuple", tupleProperty),
			undefined
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
				"prop1": {
					type: "string"
				},
				"prop2": {
					"type": "number"
				},
				"prop3": {
					"type": "boolean"
				}
			}
		};

		const result = printer.printNode(
			ts.EmitHint.Unspecified, 
			parser.parse("object", tupleProperty),
			undefined
		);

		expect(result.replace(/\s/g, "")).toBe(`
			object: {
				prop1: string;
				prop2: number;
				prop3: boolean;
			};
		`.replace(/\s/g, ""));
	});

	test("should return a object with a complex properties", () => {
		let tupleProperty: IObjectProperty = {
			type: "object",
			properties: {
				"tupleProp": {
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
				"enumProp": {
					type: "string",
					enum: [
						"long",
						"big",
						"clear",
						"sky"
					]
				},
				"arrayProp": {
					type: "array",
					items: {
						type: "boolean"
					}
				},
				"mixedProp": {
					type: ["number", "string", "boolean"]
				},
				"objectProp": {
					type: "object",
					properties: {
						"field": {
							type: "array",
							items: {
								type: ["number", "string"]
							},
							description: "what is it!?"
						}
					}
				}
			}
		};

		const result = printer.printNode(
			ts.EmitHint.Unspecified, 
			parser.parse("object", tupleProperty),
			undefined
		);

		expect(result.replace(/\s/g, "")).toBe(`
			object: {
				tupleProp: [string, number];
				enumProp: "long" | "big" | "clear" | "sky";
				arrayProp: boolean[];
				mixedProp: number | string | boolean;
				objectProp: {
					/**
					* what is it!?
					*/
					field: (number | string)[];
				};
			};
		`.replace(/\s/g, ""));
	});
});

function primitivePropTypeTest(
	type: PropertyType, 
	isReadonly = false, 
	isOptional = false, 
	expectedType = type as string
) {
	let prop = parser.parse("test", {
		type: type,
		description: `super ${type}`
	}, isReadonly, isOptional);

	const result = printer.printNode(ts.EmitHint.Unspecified, prop, undefined);
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
	let prop = parser.parse("test", {
		type: type,
		enum: values
	} as IEnumProperty<any>, isReadonly, isOptional);

	const result = printer.printNode(ts.EmitHint.Unspecified, prop, undefined);
	expect(result.replace(/\s/g, "")).toBe(`
		${isReadonly ? "readonly " : ""}test${isOptional ? "?:" : ":"} ${values.map(v => typeof v === "string" ? `"${v}"` : v).join("|")};
	`.replace(/\s/g, ""));
}
function mixedPropTypeTest(
	type: PropertyType[], 
	isReadonly = false, 
	isOptional = false
) {
	let prop = parser.parse("test", {
		type: type
	} as IProperty<any>, isReadonly, isOptional);

	const result = printer.printNode(ts.EmitHint.Unspecified, prop, undefined);
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
	let prop = parser.parse("test", {
		type: "array",
		items: {
			type
		}
	} as IArrayProperty, isReadonly, isOptional);

	const result = printer.printNode(ts.EmitHint.Unspecified, prop, undefined);
	expect(result.replace(/\s/g, "")).toBe(`
		${isReadonly ? "readonly " : ""}test${isOptional ? "?:" : ":"} ${expectedType}[];
	`.replace(/\s/g, ""));
}