import * as ts from "typescript";
import { BaseSchemaParser } from "./BaseSchemaParser";
import { IMethod } from "../types/jsonschema/IMethod";
import { IMethodSchema } from "../types/jsonschema/ISchema";
import { MethodCategoryParser } from "./components/MethodCategoryParser";

export class MethodSchemaParser extends BaseSchemaParser<IMethodSchema> {
	private readonly methodCategoryParser = new MethodCategoryParser(this.metadataResolver, this.namespaces);

	public parse(schema: IMethodSchema) {
		let parsedCategories = [];
		let categories: Record<string, IMethod[]> = {};
		for (let method of schema.methods) {
			let [categoryName] = method.name.split(".");
			if (!categoryName)
				continue;

			if (!categories?.[categoryName])
				categories[categoryName] = [];
			categories?.[categoryName]?.push(method);
		}

		for (let [name, methods] of Object.entries(categories)) {
			parsedCategories.push(
				this.methodCategoryParser.parse(name, methods)
			);
		}

		return ts.factory.createNodeArray(
			this.createNamespaceImportDeclaration().concat(parsedCategories)
		);
	}
}