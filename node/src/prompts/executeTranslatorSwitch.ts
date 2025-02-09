import queryLLMAgent from "../queryLLMAgent";
import {response} from "express";
import extract from "extract-json-from-string";

export interface TranslatorSwitch {
    en: string;
    es: string;
    fr: string;
    de: string;
    zh: string;
}

const systemPrompt = `You are a translation assistant translating passages long and short for a website.

You will be provided JSON objects with an "input" field completed in some language, but requiring English, Spanish, French, German, and Mandarin translations. You should output a new JSON with these fields completed.

Do not output anything else. MAKE SURE to keep formatting as close to the original as possible.`

export default async function executeTranslatorSwitch(text: string): Promise<TranslatorSwitch> {
    const resp = await queryLLMAgent(
        {
            content: `Please complete the JSON by providing the required translations as indicated below. Do not include anything else in your response.

\`\`\`json
{
    "input": "${text.replace(/\n/g, '\\n')}",
    "en": "<complete>",
    "es": "<complete>",
    "fr": "<complete>",
    "de": "<complete>",
    "zh": "<complete>"
}
\`\`\`
`,
            role: 'user',
        },
        'Translator',
        systemPrompt,
        [],
        'pdf',
        'article_',
    );

    return extract(resp)[0] as TranslatorSwitch;
};