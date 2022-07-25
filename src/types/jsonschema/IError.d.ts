import { IMetadata } from "./IMetadata";

export interface IError extends IMetadata {
    code: number;
    global?: boolean;
    subcodes?: ISubcode[];
}
export interface ISubcode {
    $ref?: string;
    subcode: number;
}