import generateNewsSummaries from './generateNewsSummaries';
import {Pool, QueryResult} from 'pg';
import crypto from 'node:crypto';
import {rfc3986EncodeURIComponent} from "./common";

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
        await asyncQuery(`INSERT INTO debates (id, report, image, title) VALUES ('${id}', '${rfc3986EncodeURIComponent(summary.report)}', '${summary.image}', '${rfc3986EncodeURIComponent(summary.title)}');`);
        console.log('inserted', id);

        for (let tweet of summary.citations) {
            const tweetId = crypto.randomUUID();
            await asyncQuery(`INSERT INTO debate_source (id, onPost, username, text) VALUES ('${tweetId}', '${id}', '${tweet.user.username}', '${rfc3986EncodeURIComponent(tweet.text)}');`);
        }
    }
});