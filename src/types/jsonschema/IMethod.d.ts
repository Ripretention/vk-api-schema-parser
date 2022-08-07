import { IError } from "./IError";
import { IMetadata } from "./IMetadata";
import { IArrayProperty, IEnumProperty, IObjectProperty, IProperty, IReferenceProperty } from "./IProperty";

export interface IMethod extends IMetadata {
    name: string;
    access_token_type?: ("app" | "user" | "group")[];
    parameters: (SupporetedTypes & { name: string })[];
    responses: {
        [key: string]: SupporetedTypes;
    };
    errors?: (IReferenceProperty | IError)[];
}
type SupporetedTypes = 
    IProperty<any> |
    IArrayProperty | 
    IObjectProperty | 
    IEnumProperty<any> | 
    IReferenceProperty;