import * as ts from "typescript";
import { ISchema } from "../src/types/jsonschema/ISchema";
import { IObjectProperty, IReferenceProperty } from "../src/types/jsonschema/IProperty";
import { ObjectSchemaParser } from "../src/parsers/ObjectSchemaParser";

const objectSchemaParser = new ObjectSchemaParser();
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
test("should return a primitive interface-based schema", () => {
	let schema: ISchema = {
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
		interface FstEntity {
			field: number;
		}
		/**
		* some description for second entity
		*/
		interface SndEntity {
			/**
			* a very important field
			*/
			field: string;
		}
	`.replace(/\s/g, ""));
});
describe("objects references test", () => {
	test("should return schema with a references", () => {
		let schema: ISchema = {
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
			interface FstEntity {
				field: number;
			}
			interface SndEntity {
				refArray: FstEntity[];
			}
		`.replace(/\s/g, ""));
	});
	test("should return schema with a complex references", () => {
		let schema: ISchema = {
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
			interface FstEntity {
				field: number;
			}
			interface SndEntity {
				refArray: IFstEntity[];
			}
			interface SomeEntity {
				arr: [ISndEntity[], string];
				obj: ISomeEntity;
			}
			interface Entity {
				field: (FstEntity & SomeEntity) | SndEntity;
			}
		`.replace(/\s/g, ""));
	});
});