import queryLLMAgent from "../queryLLMAgent";
import extract from "extract-json-from-string";
import {ResearchExpertResponse} from "./executeResearchExpert";

export interface ReportWriterReport {
    topic: string;
    response: string;
}
export type ReportWriterResponse = ReportWriterReport[];

const systemPrompt = `You are a journalist tasked with writing reports on the topic of cryptocurrency. You will be given opinions from four experts on specific fields of cryptocurrency, with three current affairs stories that have been covered by the articles they have read, and your job is to compile their four mini reports into a complete report, split up in three sections. Your final output will be in JSON format, but you are encouraged to outline preliminary thoughts before creating this. While you are encouraged to quote from the reports provided by the user, DO NOT mention any experts by name in your final response, ONLY their job titles/specialties, e.g. say "An analyst specialising in foreign affairs stated that ...", rather than "John Simpson stated that ...". Each of your reports should be around 200 words in length.`;

const firstMessage = (topics: string[], experts: ResearchExpertResponse[]) => `Four cryptocurrency experts have given their opinions on the following topics:
${topics.join('\n')}

Below are their opinions.

Gyöngyvér Jónás (${experts[0].roleName})
${experts[0].response}
Nadir Clausen (${experts[1].roleName})
${experts[1].response}
Caja Jeppesen (${experts[2].roleName})
${experts[2].response}
Daria Ignatova (${experts[3].roleName})
${experts[3].response}

First, analyse and note down any thoughts you have on the key points to pull out regarding each story from the corresponding analysts. Then, write a synthesised report for each story as an array of JSON objects, each with keys \`topic\` and \`report\` (both type \`string\`). In your report, use quotations from the experts’ opinions, including any quotations they may have in turn included from the articles they have read.`

export default async function executeReportWriter(topics: string[], experts: ResearchExpertResponse[]): Promise<ReportWriterResponse> {
    const response = await queryLLMAgent(
        {
            content: firstMessage(topics, experts),
            role: 'user',
        },
        'Research Coordinator',
        systemPrompt,
        [],
        'pdf',
        'article_',
        'report-writer'
    );

    return extract(response)[0] as ReportWriterResponse;
}