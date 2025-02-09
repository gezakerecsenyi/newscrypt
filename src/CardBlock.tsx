import {User, Debate} from "./types";
import {FormEvent, useCallback, useState} from "react";
import AuthCheck from "./AuthCheck";

interface Props {
    card: Debate;
    openModal?: () => void;
    authState?: [User | null, (state: User | null) => void]
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

    const [isReply, setIsReply] = useState(false);
    const sendMessage = useCallback(async () => {
        const resp = await (await fetch(
            '/comment',
            {
                method: 'POST',
                body: JSON.stringify(
                    {
                        text: chatValue,
                        onPost: card.id,
                        isReply,
                    }
                )
            }
        )).json();

        if (resp.success) {
            setLoading(false);
            setChatValue('');
        }
    }, [chatValue, isReply, authState]);

    const [showAuthCheck, setShowAuthCheck] = useState(false);
    const [loading, setLoading] = useState(false);
    const requestSendMessage = useCallback(async () => {
        if (chatValue.length) {
            setLoading(true);

            if (!authState![0]) {
                setShowAuthCheck(true);
                return;
            }

            sendMessage();
        }
    }, [chatValue, authState]);

    const handleAuthCompletion = useCallback(() => {
        setShowAuthCheck(false);
        setTimeout(() => sendMessage());
    }, [chatValue, authState]);

    const setReply = useCallback((username: string) => {
        const newChatValue = `@${username} ${chatValue.replace(/^\s*@[a-zA-Z0-9_\-!]/g, '')}`;
        setChatValue(newChatValue);
    }, [chatValue]);

    return (
        <div className="card" id={card.id}>
            { showAuthCheck && <AuthCheck closeModal={handleAuthCompletion} /> }
            <article>
                <div className="card-content">
                    <img src={card.image} alt={decodeURIComponent(card.title)} onClick={openModal}/>
                    <div className="content" onClick={openModal}>
                        <h3>{decodeURIComponent(card.title)}</h3>
                        <p className="fade-out">
                            {decodeURIComponent(card.report)}
                        </p>
                    </div>
                    <div className="chat">
                        <div className="chat-messages">
                            {card.comments?.map(comment => (<p
                                className={'chat-bubble' + (comment.isReply ? ' reply' : '')}
                                data-username={comment.fromUsername}
                                onClick={() => setReply(comment.fromUsername)}
                                key={comment.id}
                            >
                                <strong>{comment.fromUsername}:</strong> {decodeURIComponent(comment.text)}
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
                            <button onClick={requestSendMessage} disabled={loading}>Send</button>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
}