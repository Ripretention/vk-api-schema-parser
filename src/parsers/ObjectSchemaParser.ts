import * as ts from "typescript";
import { ISchema } from "../types/jsonschema/ISchema";
import { ISchemaParser } from "../types/ISchemaParser";
import { TypeMetadataResolver } from "../resolvers/TypeMetadataResolver";
import { PropertySignatureParser } from "./PropertySignatureParser";
import { toPascalCase } from "../Utils";

export class ObjectSchemaParser implements ISchemaParser<ISchema> {
	constructor(private readonly metadataResolver: TypeMetadataResolver = new TypeMetadataResolver()) {}
	private readonly propSignatureParser = new PropertySignatureParser(this.metadataResolver);

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