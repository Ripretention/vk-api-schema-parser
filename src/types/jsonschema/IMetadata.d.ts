export interface IMetadata {
    description?: string;
}
export interface INumericMetadata extends IMetadata {
    minimum?: number;
    maximum?: number;
    exclusiveMinimum?: boolean;
    exclusiveMaximum?: boolean;
}
export interface IStringMetadata extends IMetadata {
    minLength?: number;
    maxLength?: number;
    format?: 
        "date-time" | 
        "time" | 
        "date" | 
        "duration" | 
        "email" |
        "idn-email" |
        "hostname" |
        "idn-hostname" |
        "ipv4" |
        "ipv6" |
        "uuid" |
        "uri" |
        "uri-reference" |
        "iri" |
        "iri-reference";
}
export interface IObjectMetadata extends IMetadata {
    minProperties?: number;
    maxProperties?: number;
}
export interface IArrayMetadata extends IMetadata {
    minItems?: number;
    maxItems?: number;
}