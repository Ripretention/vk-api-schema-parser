import * as ts from "typescript";
import { toPascalCase } from "../Utils";
import { BaseSchemaParser } from "./BaseSchemaParser";
import { IErrorSchema } from "../types/jsonschema/ISchema";
import { ErrorSignatureResolver } from "../resolvers/ErrorSignatureResolver";

export class ErrorSchemaParser extends BaseSchemaParser<IErrorSchema> {
	private readonly errorSignatureResolver = new ErrorSignatureResolver();

	public parse(schema: IErrorSchema) {
		let errors = [];
		let definitions = [];
		let globalErrors = [];

		for (let [name, body] of Object.entries(schema.definitions.subcodes))
			definitions.push(
				ts.factory.createTypeAliasDeclaration(
					[], 
					[ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)], 
					toPascalCase(name), 
					undefined,
					this.errorSignatureResolver.resolve(body)
				)
			);
		
		for (let [name, body] of Object.entries(schema.errors)) {
			if (body.global)
				globalErrors.push(
					ts.factory.createIdentifier(toPascalCase(name))
				);

			let error = ts.factory.createInterfaceDeclaration(
				undefined,
				[ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
				toPascalCase(name),
				undefined,
				undefined,
				(this.errorSignatureResolver.resolve(body) as ts.TypeLiteralNode).members
			);
			errors.push(
				this.metadataResolver.resolve(error, body) ?? error
			);
		}

		if (globalErrors.length)
			errors.push(
				ts.factory.createTypeAliasDeclaration(
					[],
					[ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)], 
					toPascalCase("VkGlobalError"), 
					undefined,
					ts.factory.createUnionTypeNode(globalErrors)
				)
			);

		return ts.factory.createNodeArray(
			definitions.concat(errors)
		);
	}
}