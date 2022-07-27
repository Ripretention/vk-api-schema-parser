import * as ts from "typescript";
import { TypeMetadataResolver } from "../resolvers/TypeMetadataResolver";
import { TypeSignatureResolver } from "../resolvers/TypeSignatureResolver";
import { INamespace } from "../types/INamespace";
import { IMetadata } from "../types/jsonschema/IMetadata";
import { IMethod } from "../types/jsonschema/IMethod";
import { IProperty } from "../types/jsonschema/IProperty";
import { PropertySignatureParser } from "./PropertySignatureParser";

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
		let fn = ts.factory.createFunctionDeclaration(
			[],
			[
				ts.factory.createModifier(ts.SyntaxKind.PublicKeyword)
			],
			undefined,
			methodName,
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
			undefined
		);

		return this.metadataResolver?.resolve(fn, method) ?? fn;
	}

	private parseParameters(method: IMethod) {
		let properties = [];

		for (let parameter of method.parameters)
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