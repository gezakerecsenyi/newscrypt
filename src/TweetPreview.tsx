interface Props {
    tweet: Tweet;
}

export interface Tweet {
    url: string, 
    user: string, 
    text: string
}

export default function TweetPreview(
    {
        tweet
    }: Props
) {
    return (
        <>
            <style>
                {`
                    .tweet {
                        padding: 10px;
                        border: 1px solid #2f3336;
                        border-radius: 10px;
                        margin: 10px 0;
                        background-color: #1c1e21;
                        font-family: Arial, sans-serif;
                        max-width: 500px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        text-decoration: none;
                        display: block;
                        color: inherit;
                    }
                    .tweet h3 {
                        margin: 0;
                        font-size: 16px;
                        color: #ffffff;
                    }
                    .tweet p {
                        margin: 5px 0 0;
                        font-size: 14px;
                        color: #8899a6;
                    }
                `}
            </style>
            <a href={tweet.url} target="_blank" rel="noopener noreferrer" className="tweet">
                <h3>@{tweet.user}</h3>
                <p>{tweet.text}</p>
            </a>
        </>
    )
}
