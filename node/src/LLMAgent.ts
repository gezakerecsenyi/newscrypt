import OpenAI from "openai";
import {Assistant} from "openai/resources/beta/assistants";
import {debug, debuggerLog} from "./config";

const openai = new OpenAI(
    {
        baseURL: 'https://api.openai.com/v1',
        apiKey: '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'
    }
);

function bufferToReadStream(buffer: Buffer, filePath: string) {
    return new File([buffer], filePath, {type: 'text/plain'});
}

export default class LLMAgent {
    private agentName: string;
    private agentPrompt: string;
    private assistant: Assistant | null = null;
    thread: OpenAI.Beta.Threads.Thread | null = null;
    constructor(agentName: string, agentPrompt: string) {
        this.agentName = agentName;
        this.agentPrompt = agentPrompt;
    }

    async init(thread?: OpenAI.Beta.Threads.Thread) {
        this.assistant = await openai.beta.assistants.create(
            {
                name: this.agentName,
                instructions: this.agentPrompt,
                model: "gpt-4o-mini",
                tools: [{type: "file_search"}],
            }
        );

        this.thread = thread || await openai.beta.threads.create();
    }

    async addMessage(
        message: OpenAI.Beta.Threads.Messages.MessageCreateParams,
        files: Buffer[] = [],
        fileExtension: string = 'pdf',
        filenamePrefix: string = '',
    ) {
        const fileStreams = await Promise.all(
            files.map((buffer, index) => {
                return openai.files.create(
                    {
                        file: bufferToReadStream(buffer, `${filenamePrefix}${index}.${fileExtension}`),
                        purpose: "assistants",
                    }
                );
            })
        );

        if (files.length) {
            message.attachments = fileStreams.map(file => ({
                file_id: file.id,
                tools: [{
                    type: 'file_search'
                }]
            }));
        }

        await openai.beta.threads.messages.create(
            this.thread.id,
            message
        );
    }

    async run(temperature = 0.5) {
        const run = await openai.beta.threads.runs.createAndPoll(
            this.thread.id,
            {
                assistant_id: this.assistant.id,
                temperature: temperature
            },
        );

        debuggerLog('running thread.');
        debuggerLog(run.status);
        if (run.status === 'failed') {
            console.log('failed');
            console.log(run.required_action);
            console.log(run.incomplete_details);
        }

        return openai.beta.threads.messages.list(run.thread_id);
    }
}