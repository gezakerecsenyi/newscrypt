import generateNewsSummaries from './generateNewsSummaries';
import {Pool, QueryResult} from 'pg';
import crypto from 'node:crypto';
import {rfc3986EncodeURIComponent} from "./common";
import {TranslatorSwitch} from "./prompts/executeTranslatorSwitch";

const pool = new Pool(
    {
        user: 'postgres',
        host: 'localhost',
        database: 'postgres',
        password: 'admin',
        port: 5432,
    }
);

async function asyncQuery(query: string): Promise<QueryResult<any>> {
    console.log('attempting', query);
    return new Promise(resolve => {
        pool.query(query, (err, result) => {
            if (err) {
                throw err;
            }

            resolve(result);
        })
    });
}

generateNewsSummaries().then(async function (summaries) {
    for (let summary of summaries) {
        const id = crypto.randomUUID();
        await asyncQuery(`INSERT INTO debates (id, image) VALUES ('${id}', '${summary.image}');`);
        for (const key of Object.keys(summary.report) as (keyof TranslatorSwitch)[]) {
            const translationId = crypto.randomUUID();
            await asyncQuery(`INSERT INTO debates_i18n (id, language, fromdebate, report, title) VALUES ('${translationId}', '${key}', '${id}', '${rfc3986EncodeURIComponent(summary.report[key])}', '${rfc3986EncodeURIComponent(summary.title[key])}');`);
        }

        console.log('inserted', id);

        for (let tweet of summary.citations) {
            const tweetId = crypto.randomUUID();
            await asyncQuery(`INSERT INTO debate_source (id, onPost, username, text) VALUES ('${tweetId}', '${id}', '${tweet.user.username}', '${rfc3986EncodeURIComponent(tweet.text)}');`);
        }
    }
});