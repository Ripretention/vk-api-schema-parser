import * as ts from "typescript";
import { PrimitiveSignatureParser } from "../src/parsers/helpers/PrimitiveSignatureParser";

const parser = new PrimitiveSignatureParser();
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

function propTypeTest(type: string, isReadonly = false, isOptional = false, expectedType: string = type) {
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

test("should return an integer property", () => propTypeTest("integer", true, false, "number"));
test("should return a number property", () => propTypeTest("number", false, true));
test("should return a string property", () => propTypeTest("string"));
test("should return a boolean property", () => propTypeTest("boolean"));
test("should return a null property", () => propTypeTest("null", false, false, "undefined"));