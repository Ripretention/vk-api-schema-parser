import * as ts from "typescript";
import { toPascalCase } from "../Utils";
import { ISchema } from "../types/jsonschema/ISchema";
import { BaseSchemaParser } from "./BaseSchemaParser";

export class ObjectSchemaParser extends BaseSchemaParser<ISchema> {
	public parse(schema: ISchema) {
		let objects = [];
		for (let [name, body] of Object.entries(schema.definitions)) {
			let prop = this.propSignatureParser.parse(name, body);
			let object = body?.type === "object"
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

			objects.push(
				this.metadataResolver?.resolve(object, body) ?? object
			);
		}

		return ts.factory.createNodeArray(objects);
	}
}