import queryLLMAgent from "../queryLLMAgent";
import {ExpertSpec} from "./executeResearchCoordinator";

const systemPrompt = `You are an expert on a specific field related to cryptocurrency. You will receive articles about current affairs in cryptocurrency and be asked for your professional opinion. Make detailed reference to the content of the articles and draw upon your own knowledge in your subject speciality. **Make sure to use quotations from the articles** where applicable. Write in a professional tone, consistent with your field of expertise.`;

export interface ResearchExpertResponse {
    response: string;
    roleName: string;
}

export default async function executeResearchExpert(files: Buffer[], expertSpec: ExpertSpec): Promise<ResearchExpertResponse> {
    const resp = await queryLLMAgent({
        content: expertSpec.roleDescription,
        role: 'user',
    }, 'Niche Expert Researcher', systemPrompt, files, 'txt', 'article_', 0.5, expertSpec.roleName);

    return {
        response: resp,
        roleName: expertSpec.roleName,
    }
}