import * as ts from "typescript";
import { INamespace } from "../../types/INamespace";
import { IMethod } from "../../types/jsonschema/IMethod";
import { IProperty, IReferenceProperty } from "../../types/jsonschema/IProperty";
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
		let methodBody = ts.factory.createBlock([
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
		]);

		let response = this.typeSignatureResolver.resolve({
			type: undefined,
			anyOf: Object.values(method.responses)
		}) as ts.UnionOrIntersectionTypeNode;

		if (method.errors?.length) {
			let errors = this.typeSignatureResolver.resolve({
				type: undefined,
				anyOf: Object.values(method.errors) as IReferenceProperty[]
			});
			response = ts.factory.createUnionTypeNode(
				response.types.map(type => 
					ts.isQualifiedName(type)
						? ts.factory.createTypeReferenceNode(
							type,
							[errors]
						) 
						: type
				)
			);	
		}
		
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
			ts.factory.createTypeReferenceNode(
				"Promise",
				[ response ]
			),
			methodBody
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