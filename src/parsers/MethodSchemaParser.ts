import * as ts from "typescript";
import { toUpperFirstChar } from "../Utils";
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
			this.createNamespaceImportDeclaration()
				.concat(parsedCategories)
				.concat(this.createIndexClass(Object.keys(categories)))
		);
	}

	private createIndexClass(categories: string[]): any {
		let abstractCallMethod = ts.factory.createMethodDeclaration(
			[],
			[
				ts.factory.createModifier(ts.SyntaxKind.PublicKeyword),
				ts.factory.createModifier(ts.SyntaxKind.AbstractKeyword)
			],
			undefined,
			"callMethod",
			undefined,
			[],
			this.methodCategoryParser.callMethodSignature.parameters,
			this.methodCategoryParser.callMethodSignature.result,
			undefined
		);
		let properties = categories.map(category => 
			ts.factory.createPropertyDeclaration(
				[],
				[
					ts.factory.createModifier(ts.SyntaxKind.PublicKeyword),
					ts.factory.createModifier(ts.SyntaxKind.ReadonlyKeyword)
				],
				category.toLocaleLowerCase(),
				undefined,
				undefined,
				ts.factory.createNewExpression(
					ts.factory.createIdentifier(toUpperFirstChar(category)), 
					[], 
					[
						ts.factory.createIdentifier("this.callMethod")
					]
				)
			)
		);

		return ts.factory.createClassDeclaration(
			[],
			[
				ts.factory.createModifier(ts.SyntaxKind.ExportKeyword),
				ts.factory.createModifier(ts.SyntaxKind.AbstractKeyword)
			],
			"Api",
			[],
			[],
			[
				abstractCallMethod,
				...properties
			]
		);
	}
}