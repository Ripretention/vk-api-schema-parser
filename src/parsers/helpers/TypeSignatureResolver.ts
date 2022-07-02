import * as ts from "typescript";
import { IArrayProperty, IEnumProperty, IObjectProperty, IProperty } from "../../types/jsonschema/IProperty";

type SupportedTypes = IProperty<any> | IArrayProperty | IObjectProperty | IEnumProperty<any>;
export class TypeSignatureResolver {
	public resolve(object: SupportedTypes) {
		if (this.isEnumType(object))
			return this.resolveEnumType(object);
		if (this.isArrayType(object))
			return this.resolveArrayType(object);
		
		return ts.factory.createKeywordTypeNode(this.resolvePrimitiveType(object));
	}

	private isEnumType(object: SupportedTypes): object is IEnumProperty<any> {
		return (object as IEnumProperty<any>)?.enum?.length != null;
	}
	private isArrayType(object: SupportedTypes): object is IArrayProperty {
		return (object as IArrayProperty)?.items != null;
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
		return ts.factory.createArrayTypeNode(this.resolve(object.items));
	}
	public resolvePrimitiveType(object: IProperty<any>) {
		switch (object.type) {
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