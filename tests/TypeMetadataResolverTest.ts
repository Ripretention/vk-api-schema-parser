import { TypeMetadataResolver } from "../src/resolvers/TypeMetadataResolver";
import { IArrayMetadata, IMetadata, INumericMetadata, IObjectMetadata, IStringMetadata } from "../src/types/jsonschema/IMetadata";

const metadataResolver = new TypeMetadataResolver();
describe("basic metadata", () => {
	test("empty metadata test", () => {
		let metadata = {};

		let result = metadataResolver.constructMetadata(metadata);

		expect(result).toBe(null);
	});
	test("description metadata test", () => {
		let metadata: IMetadata = {
			description: "Some desc"
		};

		let result = metadataResolver.constructMetadata(metadata);

		expect(result).toBe("*\n* Some desc");
	});
	test("numeric metadata test", () => {
		let metadata: INumericMetadata = {
			minimum: 0,
			maximum: 100
		};

		let result = metadataResolver.constructMetadata(metadata);

		expect(result).toBe("*\n* Range: [0; 100]");
	});
	test("numeric metadata test with exclusive range", () => {
		let metadata: INumericMetadata = {
			minimum: 0,
			maximum: 100,
			exclusiveMinimum: true,
			exclusiveMaximum: true
		};

		let result = metadataResolver.constructMetadata(metadata);

		expect(result).toBe("*\n* Range: (0; 100)");
	});
	test("string metadata test (range)", () => {
		let metadata: IStringMetadata = {
			minLength: 4,
			maxLength: 32
		};

		let result = metadataResolver.constructMetadata(metadata);

		expect(result).toBe("*\n* Length: [4; 32]");
	});
	test("string metadata test (format)", () => {
		let metadata: IStringMetadata = {
			format: "uri"
		};

		let result = metadataResolver.constructMetadata(metadata);

		expect(result).toBe("*\n* Format: uri");
	});
	test("object metadata test", () => {
		let metadata: IObjectMetadata = {
			minProperties: 43
		};

		let result = metadataResolver.constructMetadata(metadata);

		expect(result).toBe("*\n* Minimum properties count: 43");
	});
	test("array metadata test", () => {
		let metadata: IArrayMetadata = {
			maxItems: 34
		};

		let result = metadataResolver.constructMetadata(metadata);

		expect(result).toBe("*\n* Maximum array length: 34");
	});
});