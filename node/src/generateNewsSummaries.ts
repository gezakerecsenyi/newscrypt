import getSitePDF from "./getSitePDF";
import executeResearchCoordinator from "./prompts/executeResearchCoordinator";
import {debug, debuggerLog} from "./config";
import queryNews from "./queryNews";
import executeResearchExpert from "./prompts/executeResearchExpert";
import executeReportWriter from "./prompts/executeReportWriter";
import executeTweetSummaryFlow, {TweetSummaryResponse} from "./prompts/executeTweetSummaryFlow";
import executeDebateFlow from "./prompts/executeDebateFlow";
import {existsSync, readFileSync, writeFileSync} from 'fs';
import {TwitterPost} from "./queryTwitter";

async function resolveInTurn<T>(promises: Promise<T>[], sync = true): Promise<T[]> {
    if (sync) {
        let res = [] as T[];
        for (const promise of promises) {
            res.push(await promise);
        }

        return res;
    } else {
        return Promise.all(promises);
    }
}

export interface NewsSummary {
    report: string;
    image: string;
    title: string;
    citations: TwitterPost[];
}

export default async function generateNewsSummaries(): Promise<NewsSummary[]> {
    const newsQueries: string[] = ['crypto', 'bitcoin', 'blockchain'];
    const articleData = debug ? [
        {
            "uuid": "6ecfac5b-d8bf-414c-91c7-519ee7712c92",
            "title": "Smart crypto investing with Altify’s Crypto Bundles",
            "description": "Promoted | Understanding the importance of diversifying your crypto portfolio.",
            "keywords": "",
            "snippet": "We all know investing can be intimidating at the best of times, what with multiple asset classes and millions of stocks, bonds and commodities within them. It?...",
            "url": "https://techcentral.co.za/investing-altify-crypto-bundles-altpr/236446/",
            "image_url": "https://techcentral.co.za/wp-content/uploads/2023/12/altify-crypto-investing-1078.jpg",
            "language": "en",
            "published_at": "2023-12-06T08:33:01.000000Z",
            "source": "techcentral.co.za",
            "categories": ["tech", "general"],
            "relevance_score": 21.189209,
            "locale": "za"
        },
        {
            "uuid": "bafabda6-c55f-4dd5-9ea0-3281543d4d7d",
            "title": "Crypto Crash Update, Crypto Prices, Crypto Crash Luna, Terra",
            "description": "Retail investors are finding their way through the sharp crypto crash. As prices remain subdued, experts warn against looking at the space as a get-rich-quick s...",
            "keywords": "",
            "snippet": "\n\n\n\nAkash Jain , a 34-year-old crypto investor and miner, is the true new-age investor. Investing full time in cryptocurrencies since 2015-16, he thought he spot...",
            "url": "https://www.forbesindia.com/article/take-one-big-story-of-the-day/crypto-crash-a-wakeup-call/76485/1",
            "image_url": "https://www.forbesindia.com/media/images/2022/May/img_185407_cryptocrashupdate.jpg",
            "la nguage": "en",
            "published_at": "2022-05-20T08:50:35.000000Z",
            "source": "news.google.com",
            "categories": ["general"],
            "relevance_score": 21.053429,
            "locale": "in"
        },
        {
            "uuid": "da1dd6bf-d402-4f21 -90cb-1de73c09d574",
            "title": "The crypto crash strengthens the case for crypto",
            "description": "This is a good moment to assess how radically lower crypto prices will affect how soci ally valuable crypto will prove to be.",
            "keywords": "",
            "snippet": "Crypto prices are tumbling. By one account, crypto assets have lost about US$1.35-trillion (R20.6-trillion) globall y since November, with some falling in price ...",
            "url": "https://techcentral.co.za/the-crypto-crash-strengthens-the-case-for-crypto/207166/",
            "image_url": "https://techcentral.co.za/ wp-content/uploads/2022/01/stock-share-down-2156-1120.jpg",
            "language": "en",
            "published_at": "2022-01-27T12:58:07.000000Z",
            "source": "techcentral.co.za",
            "categories": ["tech", "general"],
            "relevance_score": 21.051682,
            "locale": "za"
        }
    ] : (await resolveInTurn(newsQueries.map(query => queryNews(query))))
        .map(e => e.data)
        .flat()
        .filter((e, i, a) => i === a.findIndex(t => t.url === e.url));
    debuggerLog('got news');
    const articlePDFs = await resolveInTurn(articleData.map(data => getSitePDF(data.url)));
    debuggerLog('fetched websites');

    const researchSpec = await executeResearchCoordinator(articlePDFs);
    debuggerLog('got topics');
    const expertResponses = await resolveInTurn(researchSpec.experts.map(async expert => {
        return await executeResearchExpert(articlePDFs, expert);
    }));
    debuggerLog('got experts');

    const synthesisedReports = await executeReportWriter(researchSpec.topics, expertResponses);
    debuggerLog('got overall report');

    let tweetSummaries: TweetSummaryResponse[];
    if (debug && existsSync('tweetSummaries.json')) {
        tweetSummaries = JSON.parse(readFileSync('tweetSummaries.json', 'utf8'));
    } else {
        tweetSummaries = await resolveInTurn(synthesisedReports.map(async report => {
            const res = await executeTweetSummaryFlow(report);

            // this process can sometimes fail...
            if (!res.finalSummary.startsWith('Report on Twitter activity')) {
                res.finalSummary = res.summaries.join('\n\n');
            }

            return res;
        }));

        if (debug) {
            writeFileSync('tweetSummaries.json', JSON.stringify(tweetSummaries), 'utf8');
        }
    }
    debuggerLog('got summaries');

    const debateFlows = await resolveInTurn(tweetSummaries.map(async (summary, index) => {
        return await executeDebateFlow(summary, synthesisedReports[index]);
    }));

    return debateFlows.map((debate, index) => ({
        report: debate,
        title: synthesisedReports[index].topic,
        image: articleData[index].image_url,
        citations: tweetSummaries[index].tweetsReviewed,
    }));
}