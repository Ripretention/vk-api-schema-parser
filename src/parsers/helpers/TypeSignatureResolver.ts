import * as ts from "typescript";
import { IArrayProperty, IEnumProperty, IObjectProperty, IProperty } from "../../types/jsonschema/IProperty";
import { PropertyType } from "../../types/jsonschema/PropertyType";

type SupportedTypes = IProperty<any> | IArrayProperty | IObjectProperty | IEnumProperty<any>;
export class TypeSignatureResolver {
	public resolve(object: SupportedTypes) {
		if (this.isEnumType(object))
			return this.resolveEnumType(object);
		if (this.isArrayType(object))
			return this.resolveArrayType(object);
		if (this.isObjectType(object))
			return this.resolveObjectType(object);
		if (this.isMixedType(object))
			return this.resolveMixedType(object);

		return ts.factory.createKeywordTypeNode(this.resolvePrimitiveType(object));
	}

	private isEnumType(object: SupportedTypes): object is IEnumProperty<any> {
		return (object as IEnumProperty<any>)?.enum?.length !== undefined;
	}
	private isArrayType(object: SupportedTypes): object is IArrayProperty {
		return object?.type === "array" || (object as IArrayProperty)?.items !== undefined;
	}
	private isObjectType(object: SupportedTypes): object is IObjectProperty {
		return object?.type === "object" || (object as IObjectProperty)?.properties !== undefined;
	}
	private isMixedType(object: SupportedTypes): object is IProperty<PropertyType[]> {
		return object?.type && Array.isArray(object.type);
	}
	public resolveEnumType(object: IEnumProperty<any>) {
		let enumMembers = [];
		for (let item of object.enum) {
			let type = object.type 
				? object.type
				: typeof(item);
			
			if (type === "number")
				enumMembers.push(ts.factory.createNumericLiteral(item));
			else if (type === "bigint")
				enumMembers.push(ts.factory.createBigIntLiteral(item));
			else if (type === "string")
				enumMembers.push(ts.factory.createStringLiteral(item));
		}

		return enumMembers.length
			? ts.factory.createUnionTypeNode(
				enumMembers.map(mbr => ts.factory.createLiteralTypeNode(mbr))
			)
			: this.resolvePrimitiveType(object);
	}
	public resolveArrayType(object: IArrayProperty) {
		if (object.prefixItems?.length) {
			if (object.items)
				object.prefixItems.push(object.items);

			return ts.factory.createTupleTypeNode(object.prefixItems.map(this.resolve.bind(this)));
		}

		return ts.factory.createArrayTypeNode(this.resolve(object.items));
	}
	public resolveObjectType(object: IObjectProperty) {
		let properties = [];

		for (let [propertyName, property] of Object.entries(object.properties)) {
			properties.push(ts.factory.createPropertySignature(
				[],
				ts.factory.createIdentifier(propertyName),
				undefined,
				this.resolve(property)
			));
		}

		return ts.factory.createTypeAliasDeclaration(
			[],
			[],
			undefined,
			undefined,
			ts.factory.createTypeLiteralNode(properties)
		).type;
	}
	public resolveMixedType(object: IProperty<PropertyType[]>) {
		let types = [...new Set(object.type)]; // distinct array
		
		return ts.factory.createUnionTypeNode(
			types.map(type => 
				this.resolve({
					...object,
					type
				})
			)
		);
	}
	public resolvePrimitiveType(object: IProperty<any>) {
		switch (object?.type) {
			case "number":
			case "integer":
				return ts.SyntaxKind.NumberKeyword;
			case "string":
				return ts.SyntaxKind.StringKeyword;
			case "boolean":
				return ts.SyntaxKind.BooleanKeyword;
			case "null":
				return ts.SyntaxKind.UndefinedKeyword;
			default:
				return ts.SyntaxKind.AnyKeyword;
		}
	}
}