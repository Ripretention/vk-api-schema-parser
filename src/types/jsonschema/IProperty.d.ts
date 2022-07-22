import { IMetadata } from "./IMetadata";
import { PropertyType } from "./PropertyType";

export interface IProperty<T extends PropertyType> extends IMetadata {
	type: T;
	const?: T;
	allOf?: IProperty<any>[];
	oneOf?: IProperty<any>[];
	anyOf?: IProperty<any>[];
}
export interface IReferenceProperty extends IProperty<any> {
	$ref: string;
}
export interface IEnumProperty<T extends PropertyType> extends IProperty<T> {
	enum: any[];
}
export interface IArrayProperty extends IProperty<"array"> {
	items?: IArrayProperty | IObjectProperty | IEnumProperty<any> | IProperty<any>;
	prefixItems?: IProperty<any>[];
}
export interface IObjectProperty extends IProperty<"object"> {
	properties: {
		[key: string]: IObjectProperty | (IArrayProperty | IEnumProperty<any> | IProperty<any>) & { required?: boolean; };
	};
	required?: (keyof this["properties"])[];
	additionalProperties?: boolean;
}