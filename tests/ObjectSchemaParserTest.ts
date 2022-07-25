import * as ts from "typescript";
import { IPropertySchema } from "../src/types/jsonschema/ISchema";
import { ObjectSchemaParser } from "../src/parsers/ObjectSchemaParser";
import { IObjectProperty, IReferenceProperty } from "../src/types/jsonschema/IProperty";

const objectSchemaParser = new ObjectSchemaParser();
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
test("should return a primitive interface-based schema", () => {
	let schema: IPropertySchema = {
		$schema: "https://json.com",
		title: "obj",
		definitions: {
			fst_entity: {
				type: "object",
				description: "some description for first entity",
				properties: {
					field: {
						type: "number"
					}
				}
			} as IObjectProperty,
			snd_entity: {
				type: "object",
				description: "some description for second entity",
				properties: {
					field: {
						type: "string",
						description: "a very important field"
					}
				}
			} as IObjectProperty
		}
	};

	const result = printer.printList(
		ts.ListFormat.MultiLine, 
		objectSchemaParser.parse(schema),
		undefined
	);

	expect(result.replace(/\s/g, "")).toBe(`
		/**
		*	some description for first entity
		*/	
		export interface FstEntity {
			field?: number;
		}
		/**
		* some description for second entity
		*/
		export interface SndEntity {
			/**
			* a very important field
			*/
			field?: string;
		}
	`.replace(/\s/g, ""));
});
describe("objects references test", () => {
	test("should return schema with a references", () => {
		let schema: IPropertySchema = {
			$schema: "https://json.com",
			title: "obj",
			definitions: {
				fst_entity: {
					type: "object",
					properties: {
						field: {
							type: "number"
						}
					}
				} as IObjectProperty,
				snd_entity: {
					type: "object",
					properties: {
						refArray: {
							type: "array",
							items: {
								$ref: "schema.json#/definitions/fst_entity"
							}
						}
					}
				} as IObjectProperty
			}
		};
	
		const result = printer.printList(
			ts.ListFormat.MultiLine, 
			objectSchemaParser.parse(schema),
			undefined
		);
	
		expect(result.replace(/\s/g, "")).toBe(`	
			export interface FstEntity {
				field?: number;
			}
			export interface SndEntity {
				refArray?: FstEntity[];
			}
		`.replace(/\s/g, ""));
	});
	test("should return schema with a complex references", () => {
		let schema: IPropertySchema = {
			$schema: "https://json.com",
			title: "obj",
			definitions: {
				fst_entity: {
					type: "object",
					properties: {
						field: {
							type: "number"
						}
					}
				} as IObjectProperty,
				snd_entity: {
					type: "object",
					properties: {
						refArray: {
							type: "array",
							items: {
								$ref: "schema.json#/definitions/fst_entity"
							}
						}
					}
				} as IObjectProperty,
				some_entity: {
					type: "object",
					properties: {
						arr: {
							type: "array",
							prefixItems: [
								{
									type: "array",
									items: {
										$ref: "schema.json#/definitions/snd_entity"
									}
								},
								{
									type: "string"
								}
							]
						},
						obj: {
							"$ref": "schema.json#/definitions/some_entity"
						} as IReferenceProperty
					}
				} as IObjectProperty,
				entity: {
					type: "object",
					properties: {
						field: {
							type: "object", 
							oneOf: [
								{
									type: "object",
									allOf: [
										{
											"$ref": "schema.json#/definitions/fst_entity",
										},
										{
											"$ref": "schema.json#/definitions/some_entity"
										}
									] as IReferenceProperty[]
								},
								{
									$ref: "schema.json#/definitions/snd_entity"
								} as IReferenceProperty
							]
						}
					}
				} as IObjectProperty
			}
		};
	
		const result = printer.printList(
			ts.ListFormat.MultiLine, 
			objectSchemaParser.parse(schema),
			undefined
		);
	
		expect(result.replace(/\s/g, "")).toBe(`	
			export interface FstEntity {
				field?: number;
			}
			export interface SndEntity {
				refArray?: FstEntity[];
			}
			export interface SomeEntity {
				arr?: [SndEntity[], string];
				obj?: SomeEntity;
			}
			export interface Entity {
				field?: (FstEntity & SomeEntity) | SndEntity;
			}
		`.replace(/\s/g, ""));
	});
});