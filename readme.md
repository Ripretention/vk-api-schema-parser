# VK API SCHEMA PARSER
<p align="right">
  is easy to usage Node.js module, written on TypeScript, that allows you to parse official VK API Schemas (JSONSchema) and generate pretty and clear entities of VK API
</p>


## Feautres
 - All errors is provided.
 - Easy to usage
 - *100%* coverage of VK API Schemas
 - Most of metadates of schemas (even unique for VK API Schemas) is provided, using JSDoc
 
 ## Parsing schemas
```typescript
const logger = console.log;
const vkApiSchemaParser = new VkApiSchemaParser(logger);
await vkApiSchemaParser.parse();
```

 ## Usage parsed schemas
```typescript
import { Api } from "./vkschema/Methods"; // "./vkschema" is default output dir
	
class VkApi extends Api {
	public callMethod(methodName: string, params: object): Promise<any> {
		/**
		 * Your implementation
		 */
		return Promise.resolve({});
	}
}

// Usage API Sample
const api = new VkApi();
let { error, response } = await api.users.get({
	user_ids: [1,2,3,4],
	fields: "sex",
	name_case: "ins"
});
```
