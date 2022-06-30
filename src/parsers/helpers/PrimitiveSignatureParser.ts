import * as ts from "typescript";
import { IProperty } from "../../types/jsonschema/IProperty";
import { PropertyType } from "../../types/jsonschema/PropertyType";
import { JSDocGenerator } from "./JSDocGenerator";

export class PrimitiveSignatureParser {
	private readonly jsDocGenerator = new JSDocGenerator();
	private readonly primitiveTypes: PropertyType[] = ["boolean", "integer", "null", "number", "string"];

	public parse(objectId: string, object: IProperty<any>, isReadonly = false, isOptional = false): ts.PropertySignature {
		if (!this.primitiveTypes.includes(object.type))
			throw new Error("There isn't a primitive.");

		let prop = ts.factory.createPropertySignature(
			(isReadonly ? [ts.factory.createModifier(ts.SyntaxKind.ReadonlyKeyword)] : []),
			ts.factory.createIdentifier(objectId),
			(isOptional ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined),
			ts.factory.createKeywordTypeNode(this.resolveType(object.type))
		);
		
		this.jsDocGenerator.generate(prop, object);
		return prop;
	}

	private resolveType(objectType: string) {
		switch (objectType) {
			case "number":
			case "integer":
				return ts.SyntaxKind.NumberKeyword;
			case "string":
				return ts.SyntaxKind.StringKeyword;
			case "boolean":
				return ts.SyntaxKind.BooleanKeyword;
			case "null":
				return ts.SyntaxKind.UndefinedKeyword;
		}
	}
}