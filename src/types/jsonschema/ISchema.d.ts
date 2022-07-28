import { IError, ISubcode } from "./IError";
import { IMethod } from "./IMethod";
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
        subcodes: {
			[subcodeField: string]: ISubcode
		};
    };
    errors: {
        [error: string]: IError;
    };
}

export interface IMethodSchema extends ISchema {
	methods: IMethod[];
	termsOfService?: string;
	version?: `${number}.${number}`;
}