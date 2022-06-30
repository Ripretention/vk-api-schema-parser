import type { InterfaceDeclaration } from "typescript";
import { IProperty } from "./jsonschema/IProperty";

export interface IParser<T extends IProperty<any>> {
	parse(prop: T): InterfaceDeclaration;
}