import generateNewsSummaries from "./generateNewsSummaries";

// generateNewsSummaries().then(e => console.log(JSON.stringify(e)));

import path from "path";
import fs from "fs";

import express from "express";

const PORT = process.env.PORT || 2000;
const app = express();

app.get("/", (req, res) => {
    fs.readFile(path.resolve("../build/index.html"), "utf8", (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Internal server error. :(");
        }

        return res.send(
            data.replace(
                '{{data}}',
                JSON.stringify(
                    {
                        debates:  [
                            {
                                title: "Ethereum 2.0 Launches Successfully",
                                report: "The long-awaited Ethereum 2.0 upgrade has finally launched, bringing significant improvements to the network's scalability, security, and energy efficiency. The upgrade introduces a new proof-of-stake consensus mechanism, which is expected to reduce the network's energy consumption by over 99%. Ethereum 2.0 also includes sharding, a technique that allows the network to process multiple transactions simultaneously, greatly increasing its capacity. This upgrade is seen as a major milestone for the Ethereum community and is expected to drive further adoption of decentralized applications and smart contracts.",
                                image: "https://picsum.photos/seed/2/400/400",
                                id: "ethereum-2.0-launches-successfully",
                                comments: [
                                    { fromUsername: "Username3", text: "Finally, it's here!", onPost: "ethereum-2.0-launches-successfully", isReply: false },
                                    { fromUsername: "Username4", text: "This will change everything.", onPost: "ethereum-2.0-launches-successfully", isReply: false },
                                    { fromUsername: "Username5", text: "@Username4 Not sure if it will change everything, but it's a good start.", onPost: "ethereum-2.0-launches-successfully", isReply: true },
                                    { fromUsername: "Username6", text: "Can't wait to see the impact!", onPost: "ethereum-2.0-launches-successfully", isReply: false }
                                ]
                            },
                            {
                                title: "DeFi Market Continues to Grow",
                                report: "The decentralized finance (DeFi) market has continued to grow at an unprecedented rate, with the total value locked in DeFi protocols now exceeding $100 billion. This growth is driven by the increasing popularity of decentralized exchanges, lending platforms, and yield farming opportunities. As more users and developers enter the DeFi space, new and innovative projects are being launched, offering a wide range of financial services without the need for traditional intermediaries. This trend is expected to continue as the DeFi ecosystem matures and attracts more mainstream attention.",
                                image: "https://picsum.photos/seed/3/400/400",
                                id: "defi-market-continues-to-grow",
                                comments: [
                                    { fromUsername: "Username5", text: "DeFi is the future!", onPost: "defi-market-continues-to-grow", isReply: false },
                                    { fromUsername: "Username6", text: "So many opportunities here.", onPost: "defi-market-continues-to-grow", isReply: false }
                                ]
                            },
                            {
                                title: "Regulatory Developments in the Crypto Space",
                                report: "Regulatory developments in the cryptocurrency space have been a hot topic in recent months, with governments and regulatory bodies around the world taking steps to address the growing influence of digital assets. In the United States, the Securities and Exchange Commission (SEC) has been actively working on new regulations to provide clarity and protect investors. Meanwhile, other countries such as China and India have taken a more restrictive approach, implementing bans and strict regulations on cryptocurrency trading and mining. These developments highlight the need for a balanced approach to regulation that fosters innovation while ensuring the safety and security of the financial system.",
                                image: "https://picsum.photos/seed/4/400/400",
                                id: "regulatory-developments-in-the-crypto-space",
                                comments: [
                                    { fromUsername: "Username7", text: "Regulations are necessary.", onPost: "regulatory-developments-in-the-crypto-space", isReply: false },
                                    { fromUsername: "Username8", text: "Hope they don't stifle innovation.", onPost: "regulatory-developments-in-the-crypto-space", isReply: false }
                                ]
                            },
                            {
                                title: "New Partnerships and Collaborations in the Crypto Industry",
                                report: "The cryptocurrency industry has seen a surge in new partnerships and collaborations, as companies and projects seek to leverage each other's strengths and expand their reach. Notable recent partnerships include collaborations between major exchanges, blockchain projects, and traditional financial institutions. These partnerships are expected to drive further innovation and adoption of cryptocurrencies, as well as provide new opportunities for users and investors. As the industry continues to evolve, we can expect to see even more exciting collaborations and developments in the coming years.",
                                image: "https://picsum.photos/seed/5/400/400",
                                id: "new-partnerships-and-collaborations-in-the-crypto-industry",
                                comments: [
                                    { fromUsername: "Username9", text: "Exciting times ahead!", onPost: "new-partnerships-and-collaborations-in-the-crypto-industry", isReply: false },
                                    { fromUsername: "Username10", text: "Can't wait to see what's next.", onPost: "new-partnerships-and-collaborations-in-the-crypto-industry", isReply: false }
                                ]
                            }
                        ],
                    }
                )
            )
        );
    });
});

app.use(
    express.static(path.resolve(__dirname, '../../build'), { maxAge: "30d" })
);

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
