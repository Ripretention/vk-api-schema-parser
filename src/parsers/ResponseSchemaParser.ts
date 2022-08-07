import * as ts from "typescript";
import { toPascalCase } from "../Utils";
import { BaseSchemaParser } from "./BaseSchemaParser";
import { IPropertySchema } from "../types/jsonschema/ISchema";

export class ResponseObjectParser extends BaseSchemaParser<IPropertySchema> {
	public parse(schema: IPropertySchema) {
		let responses = [];

		for (let [name, body] of Object.entries(schema.definitions)) {
			let prop = this.propSignatureParser.parse(name, body);
			let response = ts.factory.createInterfaceDeclaration(
				undefined,
				[ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
				`${toPascalCase(name)}<TError = {}>`,
				undefined,
				undefined,
				(body.type === "object"
					? (prop.type as ts.TypeLiteralNode).members
					: [prop]
				).concat([
					ts.factory.createPropertySignature(
						[],
						"error",
						ts.factory.createToken(ts.SyntaxKind.QuestionToken),
						ts.factory.createIdentifier("TError") as any
					)
				])
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