import * as ts from "typescript";
import { PropertySignatureParser } from "../src/parsers/PropertySignatureParser";
import { IArrayProperty, IEnumProperty, IProperty } from "../src/types/jsonschema/IProperty";
import { PropertyType } from "../src/types/jsonschema/PropertyType";

const parser = new PropertySignatureParser();
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
	test("should return a primitive tuple", () => 
		tuplePropTypeTest(
			[
				{
					type: "number"
				},
				{
					type: "string"
				}
			]
		)
	);

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
function tuplePropTypeTest(
	types: IProperty<any>[], 
	isReadonly = false, 
	isOptional = false, 
	items?: IProperty<any>
) {
	let prop = parser.parse("test", {
		type: "array",
		prefixItems: types,
		items: items,
	} as IArrayProperty, isReadonly, isOptional);

	if (items)
		types.push(items);

	const result = printer.printNode(ts.EmitHint.Unspecified, prop, undefined);
	expect(result.replace(/\s/g, "")).toBe(`
		${isReadonly ? "readonly " : ""}test${isOptional ? "?:" : ":"} [${types.map(obj => obj.type).join(",")}];
	`.replace(/\s/g, ""));
}