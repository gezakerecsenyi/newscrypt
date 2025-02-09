import queryLLMAgent from "../queryLLMAgent";
import extract from "extract-json-from-string";
import {ResearchExpertResponse} from "./executeResearchExpert";
import {ReportWriterReport} from "./executeReportWriter";
import queryTwitter, {TwitterPost} from "../queryTwitter";
import LLMAgent from "../LLMAgent";
import {TextContentBlock} from "openai/resources/beta/threads";
import {debuggerLog} from "../config";

const systemPrompt = `Current date: ${new Date().toDateString()}

You are a Twitter researcher in the field of cryptocurrency. You will receive a current story about cryptocurrency to find out about, through the medium of Twitter.com. Your main focus is on the opinions and debates held on Twitter about the story. Your job is to output a search prompt to find about a dozen Tweets that will shed more light on the topic in relation to Twitter.

You will first be sent a report on the given topic, written by a team of experts. You will be asked to generate your first set of search queries. Generate around five search queries in each message. Format your response as a JSON object, with one key \`searchQueries\` (a \`string[]\`).

You will then be sent the Tweets resulting from your query (or none, if there were no hits). You should think about these, and come up with a new set of five search queries. If there are indeed results, you should also discuss what insights can be gleaned from these. **Be specific** and **make direct reference to the Tweets** in your summary of results. If you do generate a summary (i.e., if there were hits), add the key \`summary\` to your output JSON, including this. If there are no hits, simply return a JSON with one key (\`searchQueries\`, including your new search queries) instead.

Your search queries should not be more than a few words in length. Try to be specific enough to identify key details about the story, but not too specific as to not have enough results.`;

const firstMessage = (report: ReportWriterReport) => `The story you should find twitter dialogue about is ${report.topic}. Our experts have compiled the following report for you to pull from:

${report.response}

Please generate a JSON object with the key \`searchQueries\` set to a list of five strings, each short but relevant and distinctive search terms for us to pass to the Twitter API. You will then receive the response from the API, and be asked to comment and generate further search terms.`

export const formatTweet = (tweet: TwitterPost) => `From ${tweet.user.name} (@${tweet.user.username}) on ${new Date(tweet.created_at).toDateString()}:
${tweet.text.replace(/\n/g, '')}
${tweet.like_count} likes, ${tweet.reply_count} responses`;

export interface TweetSummaryResponse {
    tweetsReviewed: TwitterPost[];
    summaries: string[];
    finalSummary: string;
}

interface IntermediateJSON {
    summary?: string;
    searchQueries?: string[];
}

export default async function executeTweetSummaryFlow(report: ReportWriterReport): Promise<TweetSummaryResponse> {
    const agent = new LLMAgent('Twitter Research Assistant', systemPrompt);
    await agent.init();
    await agent.addMessage(
        {
            role: 'user',
            content: firstMessage(report),
        }
    );

    const responseText = ((await agent.run(1)).data[0].content[0] as TextContentBlock).text.value;
    debuggerLog(report.topic, responseText);
    const jsonHere = extract(responseText)[0] as IntermediateJSON;

    let nextQueries = jsonHere.searchQueries;

    const summaries = [] as string[];
    const tweetsReviewed = [] as TwitterPost[];
    for (let i = 0; i < 3 || summaries.length === 0; i++) {
        const twitterData = (await Promise.all(
            nextQueries.map(query => queryTwitter(query, Math.random() > 0.5 ? 'Latest' : 'Top'))
        )).flat();
        tweetsReviewed.push(...twitterData);

        let messageText;
        if (twitterData.length) {
            messageText = `Your queries returned ${twitterData.length} results. Here are the tweets we obtained:

${twitterData.map(tweet => formatTweet(tweet)).join('\n\n')}

===

Your task now is to first **create a summary of insights from these tweets**, especially focussing on contrasting opinions, AND generate **five new queries** to find more tweets.
${summaries.length ? '' : `
Note you can also use the following tools in your search query:
 - from:<username> (e.g. from:elonmusk) to limit searches to one specific @.
 - since:YYYY-MM-DD to limit searches to a specific time period. (remember, we care about current debate!)
`}

${summaries.length ? '' : `Your summary should be around 200 words. You should **make direct reference to the tweets**, their textual content, and the opinion of different parties on Twitter.`} Make sure to keep insights relevant to the story (${report.topic}).

Your response should end with a JSON with keys \`searchQueries\` (\`string[]\`) and \`summary\` (\`string\`).`;
        } else {
            messageText = `Your queries returned no Twitter results. Please make sure future queries are shorter or less specific, in order to return more hits.

Your task now is to generate **five new queries** to find more tweets.

You can brainstorm, but your response should end with a JSON with keys \`searchQueries\` (\`string[]\`) and \`summary\` (\`string\`).`;
        }

        await agent.addMessage(
            {
                role: 'user',
                content: messageText,
            }
        );

        const newResponse = ((await agent.run(1)).data[0].content[0] as TextContentBlock).text.value;
        debuggerLog(report.topic, newResponse);
        const newJson = extract(newResponse)[0] as IntermediateJSON;

        if (newJson) {
            if (newJson.summary) {
                summaries.push(newJson.summary);
            }

            nextQueries = newJson.searchQueries;
        }
    }

    await agent.addMessage(
        {
            role: 'user',
            content: `We'll finish there. Finally, please output an **overall summary** of the debate on Twitter. Include specific reference to:

 - Main opinions pertaining to ${report.topic}
 - Different arguments put forward on each side
 - How this compares to the experts' report on the topic
 - Reactions regarding current affairs/news on this topic
 - The consensus of Twitter (if there is one)

Your report should be around 500 words - AT LEAST three paragraphs. **Quote specific Tweets where applicable** and make sure to **name the Tweeters by their @.** Do NOT use JSON, just write in paragraphs. BE SPECIFIC in outlining the particular arguments for either side, as though in a debate.

Begin your report with: "Report on Twitter activity: ${report.topic}".

At the end of your report, start a new section, which MUST begin with "Relevant Tweets:". Under here, list the poster and Tweet contents of the ten most relevant Tweets, in your opinion, to the topic of ${report.topic}. DO NOT use JSON or analyse your choices; just list the poster's @ and Tweet text.`
        }
    );
    const finalSummary = ((await agent.run()).data[0].content[0] as TextContentBlock).text.value;
    debuggerLog(report.topic, finalSummary);

    return {
        summaries,
        tweetsReviewed,
        finalSummary,
    };
}