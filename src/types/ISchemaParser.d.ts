import { ISchema } from "./jsonschema/ISchema";
import type { NodeArray, Node } from "typescript";

export interface ISchemaParser<TSchema extends ISchema> {
	parse(schema: TSchema): NodeArray<Node>;
}