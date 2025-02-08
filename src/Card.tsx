import {Debate} from "./types";

interface Props {
    card: Debate;
}

export default function CardBlock(
    {
        card
    }: Props
) {
    return (<div className="card">
        <article>
            <div className="card-content">
                <img src="https://picsum.photos/seed/1/400/400" alt={card.title} />
                <div className="content">
                    <h3>{card.title}</h3>
                    <p className="fade-out">
                        {card.report}
                    </p>
                </div>
                <div className="chat">
                    <div className="chat-messages">
                        {card.comments.map(comment => (<p
                            className={'chat-bubble' + (comment.isReply ? ' reply' : '')}
                            data-username={comment.fromUsername}
                        >
                            <strong>{comment.fromUsername}:</strong> {comment.text}
                        </p>))}
                    </div>
                    <div className="chat-input">
                        <input type="text" placeholder="Type a message..."/>
                        <button>Send</button>
                    </div>
                </div>
            </div>
        </article>
    </div>);
}