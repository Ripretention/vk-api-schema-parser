import * as ts from "typescript";
import { INamespace } from "../../types/INamespace";
import { IMethod } from "../../types/jsonschema/IMethod";
import { TypeMetadataResolver } from "../../resolvers/TypeMetadataResolver";
import { MethodSignatureParser } from "./MethodSignatureParser";
import { toUpperFirstChar } from "../../Utils";

export class MethodCategoryParser {
	constructor(
		private readonly metadataResolver: TypeMetadataResolver = new TypeMetadataResolver(),
		private readonly namespaces?: INamespace[]
	) {}
	private readonly methodSignatureParser = new MethodSignatureParser(this.metadataResolver, this.namespaces);

	public parse(categoryName: string, methods: IMethod[]) {
		let properties = [];

		for (let method of methods) {
			let { 1: methodName } = method.name.split(".");
			properties.push(
				this.methodSignatureParser.parse(methodName, method)
			);
		}

		return ts.factory.createClassDeclaration(
			[],
			[
				ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)
			],
			toUpperFirstChar(categoryName),
			[],
			[],
			properties.concat([
				this.createCategoryConstructor()
			])
		);
	}
	
	public get callMethodSignature() {
		return {
			parameters: [
				ts.factory.createParameterDeclaration(
					[],
					[],
					undefined,
					"methodName",
					undefined,
					ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
				),
				ts.factory.createParameterDeclaration(
					[],
					[],
					undefined,
					"params",
					undefined,
					ts.factory.createKeywordTypeNode(ts.SyntaxKind.ObjectKeyword)
				)
			],
			result: ts.factory.createTypeReferenceNode(
				"Promise",
				[ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)]
			)
		};
	}
	private createCategoryConstructor() {
		let callMethodFunction = ts.factory.createFunctionTypeNode(
			[],
			this.callMethodSignature.parameters,
			this.callMethodSignature.result
		);
		let constructorParams = [
			ts.factory.createParameterDeclaration(
				[],
				[
					ts.factory.createModifier(ts.SyntaxKind.PrivateKeyword),
					ts.factory.createModifier(ts.SyntaxKind.ReadonlyKeyword)
				],
				undefined,
				"callMethod",
				undefined,
				callMethodFunction
			)
		];

		return ts.factory.createConstructorDeclaration(
			[],
			[],
			constructorParams,
			ts.factory.createBlock([])
		);
	}
}