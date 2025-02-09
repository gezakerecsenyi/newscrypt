import path from 'path';
import fs from 'fs';
import express from 'express';

import bodyParser from 'body-parser';

import {Pool, QueryResult} from 'pg';
import * as crypto from 'node:crypto';

import cookies from 'cookie-parser';
import {getHashedPassword, postgresConfig, postgresHost, rfc3986EncodeURIComponent} from "./common";
import executeTranslatorSwitch, {TranslatorSwitch} from "./prompts/executeTranslatorSwitch";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cookies());

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded(
        {
            extended: true,
        }
    )
);
const pool = new Pool(
    postgresConfig
);

const getTimestamp = () => Math.floor(new Date().getTime() / 1000);

async function asyncQuery(query: string): Promise<QueryResult<any>> {
    return new Promise(resolve => {
        pool.query(query, (err, result) => {
            if (err) {
                throw err;
            }

            resolve(result);
        })
    });
}

const checkAuth = async (req: express.Request) => {
    if (!req.cookies.authToken) {
        return null;
    }

    const tokenRes = (await asyncQuery(`SELECT * FROM user_tokens WHERE token = '${req.cookies.authToken}'`)).rows;
    console.log(tokenRes[0], getTimestamp() - tokenRes[0]?.createdat);
    if (tokenRes.length && getTimestamp() - tokenRes[0].createdat < 60 * 60 * 24) {
        console.log((await asyncQuery(`SELECT * FROM users WHERE id = '${tokenRes[0].fromuser}';`)).rows[0]);
        return (await asyncQuery(`SELECT * FROM users WHERE id = '${tokenRes[0].fromuser}';`)).rows[0];
    }

    return null;
}

app.get('/', (req, res) => {
    if (!req.cookies.locale) {
        res.cookie('locale', 'en');
    }

    fs.readFile(path.resolve('../build/index.html'), 'utf8', async (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal server error. :(');
        }

        const debates = await asyncQuery(`SELECT * FROM debates INNER JOIN debates_i18n ON debates.debateid = debates_i18n.fromdebate WHERE language = '${req.cookies.locale || 'en'}';`);
        let user = await checkAuth(req);

        await Promise.all(debates.rows.map(async (debate, i) => {
            const commentsHere = await asyncQuery(`SELECT * FROM comments INNER JOIN users ON comments.fromuser = users.id INNER JOIN comments_i18n ON comments.id = comments_i18n.fromcomment WHERE onpost = '${debate.debateid}' AND language = '${req.cookies.locale || 'en'}';`);
            const sources = await asyncQuery(`SELECT * FROM debate_source WHERE onpost = '${debate.debateid}';`);
            debates.rows[i].sources = sources.rows;
            debates.rows[i].comments = commentsHere.rows;
        }));

        return res.send(
            data.replace(
                '{{data}}',
                JSON.stringify(
                    {
                        /*                            debates: [
                            {
                                title: 'Ethereum 2.0 Launches Successfully',
                                report: 'The long-awaited Ethereum 2.0 upgrade has finally launched, bringing significant improvements to the network's scalability, security, and energy efficiency. The upgrade introduces a new proof-of-stake consensus mechanism, which is expected to reduce the network's energy consumption by over 99%. Ethereum 2.0 also includes sharding, a technique that allows the network to process multiple transactions simultaneously, greatly increasing its capacity. This upgrade is seen as a major milestone for the Ethereum community and is expected to drive further adoption of decentralized applications and smart contracts.',
                                image: 'https://picsum.photos/seed/2/400/400',
                                id: 'ethereum-2.0-launches-successfully',
                                comments: [
                                    {
                                        fromUsername: 'Username3',
                                        text: 'Finally, it's here!',
                                        onPost: 'ethereum-2.0-launches-successfully',
                                        isReply: false
                                    },
                                    {
                                        fromUsername: 'Username4',
                                        text: 'This will change everything.',
                                        onPost: 'ethereum-2.0-launches-successfully',
                                        isReply: false
                                    },
                                    {
                                        fromUsername: 'Username5',
                                        text: '@Username4 Not sure if it will change everything, but it's a good start.',
                                        onPost: 'ethereum-2.0-launches-successfully',
                                        isReply: true
                                    },
                                    {
                                        fromUsername: 'Username6',
                                        text: 'Can't wait to see the impact!',
                                        onPost: 'ethereum-2.0-launches-successfully',
                                        isReply: false
                                    }
                                ]
                            },
                            {
                                title: 'DeFi Market Continues to Grow',
                                report: 'The decentralized finance (DeFi) market has continued to grow at an unprecedented rate, with the total value locked in DeFi protocols now exceeding $100 billion. This growth is driven by the increasing popularity of decentralized exchanges, lending platforms, and yield farming opportunities. As more users and developers enter the DeFi space, new and innovative projects are being launched, offering a wide range of financial services without the need for traditional intermediaries. This trend is expected to continue as the DeFi ecosystem matures and attracts more mainstream attention.',
                                image: 'https://picsum.photos/seed/3/400/400',
                                id: 'defi-market-continues-to-grow',
                                comments: [
                                    {
                                        fromUsername: 'Username5',
                                        text: 'DeFi is the future!',
                                        onPost: 'defi-market-continues-to-grow',
                                        isReply: false
                                    },
                                    {
                                        fromUsername: 'Username6',
                                        text: 'So many opportunities here.',
                                        onPost: 'defi-market-continues-to-grow',
                                        isReply: false
                                    }
                                ]
                            },
                            {
                                title: 'Regulatory Developments in the Crypto Space',
                                report: 'Regulatory developments in the cryptocurrency space have been a hot topic in recent months, with governments and regulatory bodies around the world taking steps to address the growing influence of digital assets. In the United States, the Securities and Exchange Commission (SEC) has been actively working on new regulations to provide clarity and protect investors. Meanwhile, other countries such as China and India have taken a more restrictive approach, implementing bans and strict regulations on cryptocurrency trading and mining. These developments highlight the need for a balanced approach to regulation that fosters innovation while ensuring the safety and security of the financial system.',
                                image: 'https://picsum.photos/seed/4/400/400',
                                id: 'regulatory-developments-in-the-crypto-space',
                                comments: [
                                    {
                                        fromUsername: 'Username7',
                                        text: 'Regulations are necessary.',
                                        onPost: 'regulatory-developments-in-the-crypto-space',
                                        isReply: false
                                    },
                                    {
                                        fromUsername: 'Username8',
                                        text: 'Hope they don't stifle innovation.',
                                        onPost: 'regulatory-developments-in-the-crypto-space',
                                        isReply: false
                                    }
                                ]
                            },
                            {
                                title: 'New Partnerships and Collaborations in the Crypto Industry',
                                report: 'The cryptocurrency industry has seen a surge in new partnerships and collaborations, as companies and projects seek to leverage each other's strengths and expand their reach. Notable recent partnerships include collaborations between major exchanges, blockchain projects, and traditional financial institutions. These partnerships are expected to drive further innovation and adoption of cryptocurrencies, as well as provide new opportunities for users and investors. As the industry continues to evolve, we can expect to see even more exciting collaborations and developments in the coming years.',
                                image: 'https://picsum.photos/seed/5/400/400',
                                id: 'new-partnerships-and-collaborations-in-the-crypto-industry',
                                comments: [
                                    {
                                        fromUsername: 'Username9',
                                        text: 'Exciting times ahead!',
                                        onPost: 'new-partnerships-and-collaborations-in-the-crypto-industry',
                                        isReply: false
                                    },
                                    {
                                        fromUsername: 'Username10',
                                        text: 'Can't wait to see what's next.',
                                        onPost: 'new-partnerships-and-collaborations-in-the-crypto-industry',
                                        isReply: false
                                    }
                                ]
                            }
                        ],*/
                        debates: debates.rows,
                        currentUser: user,
                    }
                )
            )
        );
    });
});

const logIn = async (faceHash: string, password: string, res: any) => {
    const existingUser = await asyncQuery(`SELECT * FROM users WHERE facehash = '${faceHash}';`);
    if (existingUser.rows.length) {
        console.log(existingUser.rows[0], existingUser.rows[0].passwordhash);
        if (existingUser.rows[0].passwordhash === getHashedPassword(password)) {
            const token = crypto.randomUUID();
            await asyncQuery(`INSERT INTO user_tokens (id, token, fromuser, createdat) VALUES ('${token}', '${token}', '${existingUser.rows[0].id}', ${getTimestamp()});`);
            res.cookie('authToken', token, { maxAge: 1000 * 60 * 60 * 24 });
            return existingUser.rows[0];
        }

        return -1;
    }

    return null;
}

app.post('/auth', async (req, res) => {
    const user = await logIn(req.body.faceHash, req.body.password, res);
    if (typeof user === 'number') {
        res.send(JSON.stringify(
            {
                success: false,
                userExists: true,
            }
        ));
    } else if (user) {
        res.send(JSON.stringify(
            {
                success: true,
                userExists: true,
                user,
            }
        ));
    } else {
        res.send(JSON.stringify(
            {
                success: false,
                userExists: false,
            }
        ));
    }
});

app.post('/comment', async (req, res) => {
    const user = await checkAuth(req);
    if (!user) {
        res.send(JSON.stringify(
            {
                success: false
            }
        ));
    } else {
        const id = crypto.randomUUID();
        await asyncQuery(`INSERT INTO comments (id, isreply, onpost, fromuser) VALUES ('${id}', ${req.body.isreply}, '${req.body.onpost}', '${user.id}');`);

        const i18nId = crypto.randomUUID();
        await asyncQuery(`INSERT INTO comments_i18n (id, text, fromcomment, language) VALUES ('${i18nId}', '${rfc3986EncodeURIComponent(req.body.text)}', '${id}', '${req.cookies.locale || 'en'}');`);

        res.send(
            JSON.stringify(
                {
                    success: true,
                }
            )
        );

        const translatorSwitch = await executeTranslatorSwitch(req.body.text);
        for (const key of Object.keys(translatorSwitch) as (keyof TranslatorSwitch)[]) {
            if (key === (req.cookies.locale || 'en')) {
                continue;
            }

            const translationId = crypto.randomUUID();
            await asyncQuery(`INSERT INTO comments_i18n (id, text, fromcomment, language) VALUES ('${translationId}', '${translatorSwitch[key]}', '${id}', '${key}');`);
        }
    }
})

app.post('/create', async (req, res) => {
    const existingUser = await asyncQuery(`SELECT * FROM users WHERE facehash = '${req.body.facehash}' OR username = '${req.body.username}';`);
    if (existingUser.rows.length) {
        console.log(JSON.stringify(existingUser.rows[0]), req.body, JSON.stringify(req.body));
        res.send(
            JSON.stringify(
                {
                    success: false,
                    userExists: true,
                }
            )
        );
    } else {
        const uid = crypto.randomUUID();
        await asyncQuery(`INSERT INTO users (id, username, passwordhash, facehash) VALUES ('${uid}', '${req.body.username}', '${getHashedPassword(req.body.password)}', '${req.body.facehash}');`);
        const user = await logIn(req.body.facehash, req.body.password, res);
        res.send(
            JSON.stringify(
                {
                    success: true,
                    user,
                }
            )
        );
    }
});

app.use(
    express.static(path.resolve(__dirname, '../../build'), {maxAge: '30d'})
);

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
