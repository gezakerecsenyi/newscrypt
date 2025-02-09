import {TwitterPost} from "../node/src/queryTwitter";

interface Props {
    tweet: TwitterPost;
}

export default function TweetPreview(
    {
        tweet
    }: Props
) {
    return (
        <a href={tweet.url} target="_blank" rel="noopener noreferrer" className="tweet">
            <h3>@{tweet.user.username}</h3>
            <p>{tweet.text}</p>
        </a>
    )
}
