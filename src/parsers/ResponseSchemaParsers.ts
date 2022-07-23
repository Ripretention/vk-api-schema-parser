import * as ts from "typescript";
import { ISchema } from "../types/jsonschema/ISchema";
import { toPascalCase } from "../Utils";
import { BaseSchemaParser } from "./BaseSchemaParser";

export class ResponseObjectParser extends BaseSchemaParser<ISchema> {
	public parse(schema: ISchema) {
		let responses = [];
		for (let [name, body] of Object.entries(schema.definitions)) {
			let prop = this.propSignatureParser.parse(name, body);
			let response = body?.type === "object"
				? ts.factory.createInterfaceDeclaration(
					undefined,
					[ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
					toPascalCase(name),
					undefined,
					undefined,
					(body.type === "object"
						? (prop.type as ts.TypeLiteralNode).members
						: [prop]
					)
				)
				: ts.factory.createTypeAliasDeclaration(
					[], 
					[ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)], 
					toPascalCase(name), 
					undefined, 
					prop.type
				);

			responses.push(
				this.metadataResolver?.resolve(response, body) ?? response
			);
		}

		return ts.factory.createNodeArray(
			this.createNamespaceImportDeclaration().concat(responses)
		);
	}
}