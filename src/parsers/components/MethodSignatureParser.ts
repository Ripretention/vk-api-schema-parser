import * as ts from "typescript";
import { INamespace } from "../../types/INamespace";
import { IMethod } from "../../types/jsonschema/IMethod";
import { IProperty } from "../../types/jsonschema/IProperty";
import { PropertySignatureParser } from "./PropertySignatureParser";
import { TypeMetadataResolver } from "../../resolvers/TypeMetadataResolver";
import { TypeSignatureResolver } from "../../resolvers/TypeSignatureResolver";

export class MethodSignatureParser {
	constructor(
		private readonly metadataResolver: TypeMetadataResolver = new TypeMetadataResolver(),
		private readonly namespaces?: INamespace[]
	) {}
	private readonly typeSignatureResolver = new TypeSignatureResolver(this.metadataResolver, this.namespaces);
	private readonly propertySignatureParser = new PropertySignatureParser(this.metadataResolver, this.namespaces);

	public parse(
		methodName: string, 
		method: IMethod
	) {
		let methodFn = ts.factory.createMethodDeclaration(
			[],
			[
				ts.factory.createModifier(ts.SyntaxKind.PublicKeyword)
			],
			undefined,
			methodName,
			undefined,
			[],
			[
				ts.factory.createParameterDeclaration(
					[],
					[],
					undefined,
					"params",
					undefined,
					this.parseParameters(method)
				)
			],
			this.typeSignatureResolver.resolve({
				type: undefined,
				anyOf: Object.values(method.responses)
			}),
			ts.factory.createBlock([
				ts.factory.createReturnStatement(
					ts.factory.createCallExpression(
						ts.factory.createIdentifier("this.callMethod"),
						[],
						[
							ts.factory.createStringLiteral(
								method.name
							),
							ts.factory.createAsExpression(
								ts.factory.createIdentifier("params"),
								ts.factory.createKeywordTypeNode(ts.SyntaxKind.ObjectKeyword)
							)
						]
					)
				)
			])
		);

		return this.metadataResolver?.resolve(methodFn, method) ?? methodFn;
	}

	private parseParameters(method: IMethod) {
		let properties = [];

		for (let parameter of method.parameters ?? [])
			properties.push(
				this.propertySignatureParser.parse(parameter.name, parameter as IProperty<any>)
			);

		return ts.factory.createTypeAliasDeclaration(
			[],
			[],
			undefined,
			undefined,
			ts.factory.createTypeLiteralNode(properties)
		).type;
	}
}