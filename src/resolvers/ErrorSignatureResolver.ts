import * as ts from "typescript";
import { IError, ISubcode } from "../types/jsonschema/IError";
import { toPascalCase } from "../Utils";

export class ErrorSignatureResolver {
	public resolve(object: IError | ISubcode) {
		if (this.isErrorType(object))
			return this.resolveErrorType(object);
		if (this.isSubcodeType(object))
			return this.resolveSubcodeType(object);

		return ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
	}

	private isErrorType(object: IError | ISubcode): object is IError {
		return (object as IError)?.code != undefined;
	}
	private isSubcodeType(object: IError | ISubcode): object is ISubcode {
		return (object as ISubcode)?.subcode != undefined;
	}

	private resolveErrorType(object: IError) {
		let properties = [];

		properties.push(
			ts.factory.createPropertySignature(
				[],
				"code",
				undefined,
				object?.subcodes?.length
					? ts.factory.createUnionTypeNode([
						this.resolveCode(object.code), 
						...(object.subcodes.map(this.resolveCode))
					])
					: this.resolveCode(object.code)
			)
		);
		if (object?.global)
			properties.push(
				ts.factory.createPropertySignature(
					[],
					"global",
					undefined,
					ts.factory.createLiteralTypeNode(ts.factory.createTrue())
				)
			);

		return ts.factory.createTypeAliasDeclaration(
			[],
			[],
			undefined,
			undefined,
			ts.factory.createTypeLiteralNode(properties)
		).type;
	}
	private resolveSubcodeType(object: ISubcode) {
		return this.resolveCode(object.subcode);
	}

	private resolveCode(code: number | ISubcode): any {
		if (typeof code === "number")
			return ts.factory.createLiteralTypeNode(ts.factory.createNumericLiteral(code));
		else if (code?.$ref)
			return ts.factory.createIdentifier(toPascalCase(code.$ref.match(/#\/definitions\/(?:subcodes\/)?(.+)/i)[1]));

		return ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
	}
}