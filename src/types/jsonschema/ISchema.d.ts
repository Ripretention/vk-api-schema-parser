import { IError, ISubcode } from "./IError";
import { IProperty } from "./IProperty";

export interface ISchema {
	title: string;
	$schema: string;
}

export interface IPropertySchema extends ISchema {
	definitions: {
		[field: string]: IProperty<any>;
	};
}

export interface IErrorSchema extends ISchema {
	definitions: {
        [subcodeField: string]: ISubcode;
    };
    errors: {
        [error: string]: IError;
    };
}