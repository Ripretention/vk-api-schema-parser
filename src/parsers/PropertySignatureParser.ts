import * as ts from "typescript";
import { IProperty } from "../types/jsonschema/IProperty";
import { JSDocGenerator } from "./helpers/JSDocGenerator";
import { TypeSignatureResolver } from "./helpers/TypeSignatureResolver";

export class PropertySignatureParser {
	private readonly jsDocGenerator = new JSDocGenerator();
	private readonly typeSignatureResolver = new TypeSignatureResolver();

	public parse(objectId: string, object: IProperty<any>, isReadonly = false, isOptional = false): ts.PropertySignature {
		let prop = ts.factory.createPropertySignature(
			(isReadonly ? [ts.factory.createModifier(ts.SyntaxKind.ReadonlyKeyword)] : []),
			ts.factory.createIdentifier(objectId),
			(isOptional ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined),
			this.typeSignatureResolver.resolve(object)
		);
		
		if (object.description)
			this.jsDocGenerator.generate(prop, object);
		return prop;
	}
}