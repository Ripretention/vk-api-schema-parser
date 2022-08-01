export const toPascalCase = (str: string) => 
	str.replace(/(?:^|_)(\w{1})/gi, (_, v) => v.toUpperCase());
export const toUpperFirstChar = (str: string) => 
	str.replace(/^(\p{Ll})/u, (_, v) => v.toUpperCase());