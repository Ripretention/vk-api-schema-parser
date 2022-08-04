import * as ts from "typescript";

export class Printer {
	private readonly tsPrinter = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
	public print(parsedSchema: ts.Node) {
		return this.tsPrinter.printNode(
			ts.EmitHint.Unspecified, 
			parsedSchema,
			undefined
		);
	}
	public printList(parsedSchema: ts.NodeArray<ts.Node>) {
		return this.tsPrinter.printList(
			ts.ListFormat.MultiLine, 
			parsedSchema,
			undefined
		);
	}
}