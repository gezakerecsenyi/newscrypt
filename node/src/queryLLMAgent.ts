import OpenAI from "openai";

import {TextContentBlock} from "openai/resources/beta/threads";
import {debug, debuggerLog, promptCache} from "./config";
import LLMAgent from "./LLMAgent";

export default async function queryLLMAgent(
    message: OpenAI.Beta.Threads.Messages.MessageCreateParams,
    agentName: string,
    agentPrompt: string,
    files: Buffer[],
    fileExtension: string = 'txt',
    filenamePrefix: string = '',
    temperature: number = 0.5,
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
        resp = await agent.run(temperature);
    }

    return (resp.data[0].content[0] as TextContentBlock).text.value;
}