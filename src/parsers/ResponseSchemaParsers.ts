import * as ts from "typescript";
import { toPascalCase } from "../Utils";
import { BaseSchemaParser } from "./BaseSchemaParser";
import { IPropertySchema } from "../types/jsonschema/ISchema";

export class ResponseObjectParser extends BaseSchemaParser<IPropertySchema> {
	public parse(schema: IPropertySchema) {
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