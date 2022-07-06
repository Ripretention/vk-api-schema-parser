import { IProperty } from "./IProperty";

export interface ISchema {
	title: string;
	$schema: string;
	definitions: {
		[field: string]: IProperty<any>;
	};
}