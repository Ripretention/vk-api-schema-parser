import * as ts from "typescript";
import { ISchema } from "../types/jsonschema/ISchema";
import { PropertySignatureParser } from "./components/PropertySignatureParser";
import { TypeMetadataResolver } from "../resolvers/TypeMetadataResolver";
import { INamespace } from "../types/INamespace";

export abstract class BaseSchemaParser<TSchema extends ISchema> {
	constructor(
		protected readonly namespaces?: INamespace[], 
		protected readonly metadataResolver: TypeMetadataResolver = new TypeMetadataResolver()
	) {}
	protected readonly propSignatureParser = new PropertySignatureParser(this.metadataResolver, this.namespaces);
	protected createNamespaceImportDeclaration() {
		return this.namespaces.map(namespace => ts.factory.createImportDeclaration(
			[],
			[],
			ts.factory.createImportClause(
				false,
				undefined,
				ts.factory.createNamespaceImport(namespace.id)
			),
			ts.factory.createStringLiteral(namespace.path.replace(".ts", ""))
		));
	}
	
	public abstract parse(schema: TSchema): ts.NodeArray<ts.Node>;
}