import queryLLMAgent from "../queryLLMAgent";
import extract from "extract-json-from-string";
import OpenAI from "openai";

export interface ExpertSpec {
    roleName: string;
    roleDescription: string;
}

export interface ResearchCoordinatorResponse {
    topics: string[];
    experts: ExpertSpec[];
}

const systemPrompt = `You are a research coordinator, leading a team of various professionals with different specialisations. You will receive news articles as PDFs on the topic of cryptocurrency. You will decide on the 3 major stories reflected in the articles as a whole, summarising each story with a single descriptor name e.g. "Debate over ethics of X coin".

Your task is to delegate to your 4 professionals, 2 of whom are fixed as a 'Crypto Expert' and a 'Political Editor'. Choose the roles of the other 2 professionals depending on the contents of the three stories, picking professionals that will provide real insight into the topics, e.g. if something to do with crypto in China is a story it could be a 'Chinese Business Expert'.

You should write 4 instruction paragraphs for each of your chosen team members, outlining their role and informing them that they need to write a mini report within their field about each of the three stories, which you will inform them of with the 3 descriptor names you have chosen to describe them as in the format "1. XXX, 2. ZZZ, 3. YYY", very matter of factly. Tell them to write a mini report, do not tell them what to write about the articles. Note that your team members will also receive the same pdfs as you. Tell them explicitly what their role is (e.g. "You are a Crypto Expert").

The titles of your three stories should be quite specific. For instance, instead of "Recent crypto market crash", consider something more like "XRP and Dogecoin drop". Make sure your story titles are specific and distinct from each other. 

Format your response as a JSON object, with keys \`topics\` (an array of strings) and \`experts\` (an array of objects, each with keys \`roleName\` and \`roleDescription\`).`

const firstMessage = `Find attached news articles. Please provide your instruction paragraphs for four chosen experts (including a ‘Crypto Expert’ and a ‘Political Editor’, and two others), providing your response as JSON.`

export default async function executeResearchCoordinator(files: Buffer[]): Promise<ResearchCoordinatorResponse> {
    const response = await queryLLMAgent(
        {
            content: firstMessage,
            role: 'user',
        },
        'Research Coordinator',
        systemPrompt,
        files,
        'pdf',
        'article_',
        'research-coordinator'
    );

    return extract(response)[0] as ResearchCoordinatorResponse;
}