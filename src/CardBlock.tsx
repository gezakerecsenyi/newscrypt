import {Auth, Debate} from "./types";
import {FormEvent, useCallback, useState} from "react";
import AuthCheck from "./AuthCheck";

interface Props {
    card: Debate;
    openModal?: () => void;
    authState?: [Auth | null, (state: Auth | null) => void]
}

export default function CardBlock(
    {
        card,
        openModal,
        authState,
    }: Props
) {
    const [chatValue, setChatValue] = useState('');
    const handleChatChange = useCallback((e: FormEvent<HTMLInputElement>) => {
        setChatValue(e.currentTarget.value);
    }, []);

    const [showAuthCheck, setShowAuthCheck] = useState(false);
    const [loading, setLoading] = useState(false);
    const sendMessage = useCallback(async () => {
        if (chatValue.length) {
            setLoading(true);

            if (!authState![0]) {
                setShowAuthCheck(true);
            }
        }
    }, [chatValue, authState]);

    const handleAuthCompletion = useCallback(() => {
        setShowAuthCheck(false);
    }, [chatValue, authState]);

    return (
        <div className="card" id={card.id}>
            { showAuthCheck && <AuthCheck closeModal={handleAuthCompletion} /> }
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
                        <div className="input-block">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={chatValue}
                                onInput={handleChatChange}
                                disabled={loading}
                            />
                            <button onClick={sendMessage} disabled={loading}>Send</button>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
}