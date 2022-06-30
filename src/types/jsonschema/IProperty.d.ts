import { PropertyType } from "./PropertyType";

export interface IProperty<T extends PropertyType> {
	type: T;
	const?: T;
	description?: string;
	oneOf?: IProperty<any>[];
	anyOf?: IProperty<any>[];
}
export interface IReferenceProperty {
	$ref: string;
	description?: string;
}
export interface IEnumProperty<T extends PropertyType> extends IProperty<T> {
	enum: T[];
}
export interface IArrayProperty extends IProperty<"array"> {
	items: IArrayProperty | IObjectProperty | IEnumProperty<any> | IProperty<any>;
}
export interface IObjectProperty extends IProperty<"object"> {
	properties: {
		[key: string]: IArrayProperty | IObjectProperty | IEnumProperty<any> | IProperty<any>;
	};
	required?: string[];
	additionalProperties?: boolean;
}