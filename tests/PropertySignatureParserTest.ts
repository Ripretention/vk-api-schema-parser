import * as ts from "typescript";
import { PropertySignatureParser } from "../src/parsers/PropertySignatureParser";
import { IArrayProperty, IEnumProperty } from "../src/types/jsonschema/IProperty";
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
});
describe("array property test", () => {
	test("should return a primitive array", () => {
		for (let type of ["string", "boolean", "number"] as PropertyType[]) {
			arrayPropTypeTest(type, false, false);
		}
	});
});

function primitivePropTypeTest(
	type: PropertyType, 
	isReadonly = false, 
	isOptional = false, 
	expectedType: string = type
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
		enum: values,
		description: `super ${type}[]`
	} as IEnumProperty<typeof type>, isReadonly, isOptional);

	const result = printer.printNode(ts.EmitHint.Unspecified, prop, undefined);
	expect(result.replace(/\s/g, "")).toBe(`
		/*** super ${type}[] */
		${isReadonly ? "readonly " : ""}test${isOptional ? "?:" : ":"} ${values.map(v => typeof v === "string" ? `"${v}"` : v).join("|")};
	`.replace(/\s/g, ""));
}
function arrayPropTypeTest(
	type: PropertyType, 
	isReadonly = false, 
	isOptional = false, 
	expectedType: string = type
) {
	let prop = parser.parse("test", {
		type: "array",
		items: {
			type
		},
		description: `super ${type}[]`
	} as IArrayProperty, isReadonly, isOptional);

	const result = printer.printNode(ts.EmitHint.Unspecified, prop, undefined);
	expect(result.replace(/\s/g, "")).toBe(`
		/*** super ${type}[] */
		${isReadonly ? "readonly " : ""}test${isOptional ? "?:" : ":"} ${expectedType}[];
	`.replace(/\s/g, ""));
}