import * as ts from "typescript";
import { ISchema } from "../types/jsonschema/ISchema";
import { ISchemaParser } from "../types/ISchemaParser";
import { TypeMetadataResolver } from "./helpers/TypeMetadataResolver";
import { PropertySignatureParser } from "./PropertySignatureParser";

export class ObjectSchemaParser implements ISchemaParser<ISchema> {
	constructor(private readonly metadataResolver: TypeMetadataResolver = new TypeMetadataResolver()) {}
	private readonly propSignatureParser = new PropertySignatureParser(this.metadataResolver);

	public parse(schema: ISchema) {
		let objects = [];
		for (let [name, body] of Object.entries(schema.definitions)) {
			let prop = this.propSignatureParser.parse(name, body);

			let interfaceSignature = ts.factory.createInterfaceDeclaration(
				undefined,
				undefined,
				this.normalizeName(name),
				undefined,
				undefined,
				(body.type === "object"
					? (prop.type as ts.TypeLiteralNode).members
					: [prop]
				)
			);

			objects.push(
				this.metadataResolver?.resolve(interfaceSignature, body) ??	interfaceSignature
			);
		}

		return ts.factory.createNodeArray(objects);
	}
	private normalizeName(name: string) {
		return "I" + name.replace(/(?:^|_)(\w{1})/gi, (_, v) => v.toUpperCase());
	}
}