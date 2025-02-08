import {Debate} from "./types";
import {FormEvent, useCallback, useState} from "react";

interface Props {
    card: Debate;
    openModal?: () => void;
}

export default function CardBlock(
    {
        card,
        openModal
    }: Props
) {
    const [chatValue, setChatValue] = useState('');
    const handleChatChange = useCallback((e: FormEvent<HTMLInputElement>) => {
        setChatValue(e.currentTarget.value);
    }, []);

    return (
        <div className="card" id={card.id}>
            <article>
                <div className="card-content">
                    <img src={card.image} alt={card.title} onClick={openModal}/>
                    <div className="content" onClick={openModal}>
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
                                onClick={() => setChatValue(`@${comment.fromUsername}`)}
                                key={comment.id}
                            >
                                <strong>{comment.fromUsername}:</strong> {comment.text}
                            </p>))}
                        </div>
                        <div className="chat-input">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={chatValue}
                                onInput={handleChatChange}
                            />
                            <button>Send</button>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
}