import {formatTweet, TweetSummaryResponse} from "./executeTweetSummaryFlow";
import {ReportWriterReport} from "./executeReportWriter";
import LLMAgent from "../LLMAgent";
import {TextContentBlock} from "openai/resources/beta/threads";
import {debuggerLog} from "../config";

const getDebaterSystemText = (name: string, roleTitle: string, roleDescription: string, twitterReport: TweetSummaryResponse, expertReport: ReportWriterReport) => `You are a social media expert named ${name}, representing the ${roleTitle} on a debate on ${expertReport.topic}. Crucially, you are not to provide your own opinion, but rather to represent the views of social media on this theme.

A team of experts have reviewed the news surrounding the topic of ${expertReport.topic}. Their final summary is below:

${expertReport.topic}

${roleDescription}

Make sure to:
 - Include specific quotes from the Tweets and the reports
 - Be specific in your argument.
 - Remain true to the views of people on Twitter. Name key accounts as you see fit.

You MUST quote and attribute by name AT LEAST THREE tweets per response.
 
**Do not forget to start all of your responses with "${name}:".**

Here is a comprehensive summary of the key themes of the Twitter discussion, based on a review of hundreds of recent Tweets:

${twitterReport.finalSummary}`;

const journalistSystemText = (twitterReport: TweetSummaryResponse, expertReport: ReportWriterReport) => `You are a journalist reporting on a debate on ${expertReport.topic}. Crucially, this debate is interesting because the opposition (Karim) and proposition (Andreja) are social media experts, rather than crypto experts: they represent the views of the social media community.

They both began with this report on the Twitter discourse:

${twitterReport.finalSummary.split('Relevant Tweets:')[0]}

Additionally, they received a report written by a set of experts on the topic:

${expertReport.response}

Your job as the journalist will be to produce a write-up on the debate. Aim for around 500 words. Your report should:
 - Include a summary of the proceedings of the debate
 - Specifically mention key points raised by either side
 - Match their arguments to the points raised by Twitter
 - Compare this to the expert literature on the topic
 - Draw a conclusion about which side won the debate
 - NOT be ambiguous or use vague terms such as "some believe" or "necessary effect" - always explain in relation to the social media landscape
 - NOT name Karim or Andreja, to protect their identities. Refer to them as "The Twitter proposition" and "The Twitter opposition" instead.
 - NOT use references/citations in your answer: DO use quotations, but describe the source of these in text, rather than by linking a citation
 
Remember to include quotes from Tweets, arguments from Karim and Andreja, and the news sources. You will receive a set of Tweets as a file to pull from, but you should predominantly make reference to the proceedings of the debate in the process.

You may find the following a useful starting-point:

${twitterReport.finalSummary.split('Relevant Tweets:')[1]?.trim()}`

export default async function executeDebateFlow(twitterReport: TweetSummaryResponse, expertReport: ReportWriterReport) {
    const moderator = new LLMAgent(
        'Debate Moderator',
        `You are a debate moderator. Karim and Andreja, two social media experts, will respectively represent the proposition and opposition for a debate titled "${expertReport.topic}".

Crucially, Karim and Andreja are not voicing their own opinions: rather, they are supposed to reflect the views of Twitter on the topic, pulling on knowledge of current affairs. Everyone is provided the same introductory report on the topic:

${expertReport.response}

Your role is:
 - To ask questions from Karim and Andreja to guide the debate, related to the topic at hand the social media discourse
 - To keep their responses on track, reminding them to adopt the correct tone and focus in future responses if necessary
 - To ensure that sufficient context and specific quotation is included in any references they make.
 
The debate format will be simple, with you asking a question, and then Karim and Andreja responding (always in this order). You will then get a chance to briefly comment on their responses, before asking the next question. There will be four rounds in total.

**Do not forget to start all of your responses with "Moderator:".**`
    );
    await moderator.init();
    await moderator.addMessage(
        {
            role: 'user',
            content: `**MOC:** Moderator, please ask your first question.`,
        }
    );

    const karim = new LLMAgent(
        'Karim (proposition)',
        getDebaterSystemText(
            'Karim',
            'proposition',
            `As the proposition, when it is your turn, provide a 200-300 word argument in response to the moderator's last question. The opposition will have the opportunity to respond.`,
            twitterReport,
            expertReport
        )
    );
    await karim.init(moderator.thread);

    const andreja = new LLMAgent(
        'Andreja (opposition)',
        getDebaterSystemText(
            'Andreja',
            'opposition',
            `As the opposition, when it is your turn, provide a 200-300 word argument in response to the moderator's last question and the proposition's argument. After this, the debate will move on to the next question.`,
            twitterReport,
            expertReport
        )
    );
    await andreja.init(moderator.thread);

    for (let round = 0; round < 4; round++) {
        let res = await moderator.run();
        debuggerLog((res.data[0].content[0] as TextContentBlock).text.value);
        res = await karim.run(0.8);
        debuggerLog((res.data[0].content[0] as TextContentBlock).text.value);
        res = await andreja.run(0.8);
        debuggerLog((res.data[0].content[0] as TextContentBlock).text.value);
    }

    const journalist = new LLMAgent(
        'Journalist',
        journalistSystemText(twitterReport, expertReport)
    );
    await journalist.init(moderator.thread);
    await journalist.addMessage(
        {
            role: 'user',
            content: '**MOC:** Thank you all for your inputs. Journalist, please now produce your report on the debate.',
        },
        [Buffer.from(twitterReport.tweetsReviewed.map(tweet => formatTweet(tweet)).join('\n\n'))],
        'txt',
        'tweet_dataset_'
    );

    return ((await journalist.run()).data[0].content[0] as TextContentBlock).text.value;
}