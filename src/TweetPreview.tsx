import {DebateSource} from "./types";

interface Props {
    tweet: DebateSource;
}

export default function TweetPreview(
    {
        tweet
    }: Props
) {
    return (
        <a href={tweet.url} target="_blank" rel="noopener noreferrer" className="tweet">
            <h3>@{tweet.username}</h3>
            <p>{tweet.text}</p>
        </a>
    )
}
