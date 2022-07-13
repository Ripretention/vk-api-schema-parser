import * as ts from "typescript";

export class TypeMetadataResolver {
	public resolve<TNode extends ts.Node>(node: TNode, object: { description?: string }): TNode {
		let description = this.constructDescription(object);

		if (description !== null)
			ts.addSyntheticLeadingComment(
				node,
				ts.SyntaxKind.MultiLineCommentTrivia,
				description,
				true
			);

		return node;
	}

	private constructDescription(object: { description?: string; }): string {
		let descriptionComponents = [];

		if (object.description)
			descriptionComponents.push(object.description);

		return descriptionComponents.length > 0
			? `*${descriptionComponents.map(str => "* " + str).join("\n")} `
			: null;
	}
}