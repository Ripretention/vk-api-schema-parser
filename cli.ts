import VkApiSchemaParser from "./";
import * as readline from "node:readline";
import { stdin, stdout } from "process";
import { promisify } from "util";

const rl = readline.createInterface({ input: stdin, output: stdout });
const question = promisify(rl.question).bind(rl);

async function run() {
	console.log("Welcome to VKontakte Schema Parser CLI");

	let answer = await question("Do you want to clean up temp files after parsing? Y/N ");
	let cleanUp = /^y$/i.test(answer);
	answer = await question("Output path (default: ./vkschema): ");
	let outputPath = answer.trim() !== "" ? answer : undefined;

	await new VkApiSchemaParser(console.log).parse(outputPath, cleanUp);
}
run().catch(console.error);
