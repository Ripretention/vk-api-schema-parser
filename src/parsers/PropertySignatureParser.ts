import * as ts from "typescript";
import { IProperty } from "../types/jsonschema/IProperty";
import { TypeMetadataResolver } from "../resolvers/TypeMetadataResolver";
import { TypeSignatureResolver } from "../resolvers/TypeSignatureResolver";

export class PropertySignatureParser {
	constructor(private readonly metadataResolver: TypeMetadataResolver = new TypeMetadataResolver()) {}
	private readonly typeSignatureResolver = new TypeSignatureResolver(this.metadataResolver);

	public parse(
		objectId: string, 
		object: IProperty<any>, 
		isReadonly = false, 
		isOptional = false
	): ts.PropertySignature {
		let readonlyKeyword = isReadonly 
			? [ts.factory.createModifier(ts.SyntaxKind.ReadonlyKeyword)] 
			: [];
		let optinalKeyword = isOptional 
			? ts.factory.createToken(ts.SyntaxKind.QuestionToken) 
			: undefined;

		let prop = ts.factory.createPropertySignature(
			readonlyKeyword,
			ts.factory.createIdentifier(objectId),
			optinalKeyword,
			this.typeSignatureResolver.resolve(object)
		);
		
		return this.metadataResolver?.resolve(prop, object) ?? prop;
	}
}