import * as ts from "typescript";
import { IArrayMetadata, IMetadata, INumericMetadata, IObjectMetadata, IStringMetadata } from "../types/jsonschema/IMetadata";

export class TypeMetadataResolver {
	public resolve<TNode extends ts.Node>(node: TNode, object: IMetadata): TNode {
		let metadata = this.constructMetadata(object);
		return metadata !== null
			? ts.addSyntheticLeadingComment(
				node,
				ts.SyntaxKind.MultiLineCommentTrivia,
				metadata,
				true
			)
			: node;
	}
	public constructMetadata(object: IMetadata): string | null {
		let metadata = [];
		metadata.push(object?.description);
		metadata.push(this.consctuctStringFormat(object));
		metadata.push(this.constructNumericRange(object));
		metadata.push(this.constructArrayLengthRange(object));
		metadata.push(this.constructStringLengthRange(object));
		metadata.push(this.constructObjectPropertiesCountRange(object));
		
		metadata = metadata.filter(m => m != null);
		return metadata.length
			? "*\n" + metadata.map(str => "* " + str).join("\n")
			: null;
	}

	private consctuctStringFormat(object: IStringMetadata): string {
		return object.format
			? `Format: ${object.format}`
			: null;
	}
	private constructNumericRange(object: INumericMetadata): string {
		let { minimum: min, maximum: max } = object ?? {};

		let minBorder = (min == undefined || (object?.exclusiveMinimum ?? false) 
			? "(" 
			: "["
		) + (min ?? "-∞");
		let maxBorder = (max ?? "∞") + (max == undefined || (object?.exclusiveMaximum ?? false) 
			? ")" 
			: "]"
		);
		
		return min !== undefined || max !== undefined
			? `Range: ${minBorder}; ${maxBorder}`
			: null;
	}
	private constructArrayLengthRange(object: IArrayMetadata): string {
		let { minItems: min, maxItems: max } = object ?? {};

		if (min && max)
			return `Array length: [${min}; ${max}]`;
		else if (min)
			return `Minimum array length: ${min}`;
		else if (max)
			return `Maximum array length: ${max}`;
		else
			return null;
	}
	private constructStringLengthRange(object: IStringMetadata): string {
		let { minLength: min, maxLength: max } = object ?? {};

		if (min && max)
			return `Length: [${min}; ${max}]`;
		else if (min)
			return `Minimum length: ${min}`;
		else if (max)
			return `Maximum length: ${max}`;
		else
			return null;
	}
	private constructObjectPropertiesCountRange(object: IObjectMetadata): string {
		let { minProperties: min, maxProperties: max } = object ?? {};

		if (min && max)
			return `Properties count: [${min}; ${max}]`;
		else if (min)
			return `Minimum properties count: ${min}`;
		else if (max)
			return `Maximum properties count: ${max}`;
		else
			return null;
	}
}