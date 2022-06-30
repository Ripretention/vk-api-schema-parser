import * as ts from "typescript";

export class JSDocGenerator {
	public generate(node: ts.Node, object: { description?: string }) {
		ts.addSyntheticLeadingComment(
			node,
			ts.SyntaxKind.MultiLineCommentTrivia,
			this.constructDescription(object),
			true
		);
	}

	private constructDescription(object: { description?: string; }) {
		let descriptionComponents = [];

		if (object.description)
			descriptionComponents.push(object.description);

		return descriptionComponents.length > 0
			? `*${descriptionComponents.map(str => "* " + str).join("\n")} `
			: null;
	}
}