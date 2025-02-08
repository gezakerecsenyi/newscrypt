import OpenAI from "openai";

// const openai = new OpenAI(
//     {
//         baseURL: 'https://api.deepseek.com',
//         apiKey: 'sk-e9527052ec2844f48d48d6283a1bfc51'
//     }
// );
import {TextContentBlock} from "openai/resources/beta/threads";
import {debug, debuggerLog, promptCache} from "./config";
import LLMAgent from "./LLMAgent"; // Native Node Module

export default async function queryLLMAgent(
    message: OpenAI.Beta.Threads.Messages.MessageCreateParams,
    agentName: string,
    agentPrompt: string,
    files: Buffer[],
    fileExtension: string = 'pdf',
    filenamePrefix: string = '',
    debugIdentifier?: string,
) {
    let resp: OpenAI.Beta.Threads.Messages.MessagesPage;
    if (debug && debugIdentifier) {
        resp = promptCache.get(debugIdentifier);
    } else {
        debuggerLog('running LLM agent.');

        const agent = new LLMAgent(agentName, agentPrompt);
        await agent.init();
        await agent.addMessage(message, files, fileExtension, filenamePrefix);
        resp = await agent.run();

        debuggerLog(JSON.stringify(resp));
    }

    return (resp.data[0].content[0] as TextContentBlock).text.value;
}