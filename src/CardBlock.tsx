import { User, Debate } from "./types";
import { FormEvent, useCallback, useState } from "react";
import AuthCheck from "./AuthCheck";
import TweetPreview from "./TweetPreview";
import useLocale from "./useLocale";

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

    const [comments, setComments] = useState(card.comments);

    const [isReply, setIsReply] = useState(false);
    const sendMessage = useCallback(async () => {
        if (!authState![0]?.id) {
            setLoading(false);
            return;
        }

        const resp = await (await fetch(
            '/comment',
            {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    {
                        text: chatValue,
                        onpost: card.debateid,
                        isreply: isReply,
                    }
                )
            }
        )).json();

        setLoading(false);
        if (resp.success) {
            setComments(
                [
                    ...comments,
                    {
                        username: authState![0]!.username,
                        isreply: isReply,
                        text: chatValue,
                        onpost: card.debateid,
                        id: Math.random().toString(),
                    }
                ]
            );
            setChatValue('');
        }
    }, [chatValue, isReply, authState, card]);

    const [showAuthCheck, setShowAuthCheck] = useState(false);
    const [loading, setLoading] = useState(false);
    const requestSendMessage = useCallback(async () => {
        if (chatValue.length) {
            setLoading(true);

            if (!authState![0]?.id) {
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

    const [activeTab, setActiveTab] = useState('summary');

    const setReply = useCallback((username: string) => {
        const newChatValue = `@${username} ${chatValue.replace(/^\s*@[a-zA-Z0-9_\-!]+\s+/g, '')}`;
        setChatValue(newChatValue);
    }, [chatValue]);

    const localizer = useLocale();

    return (
        <div className="card" id={card.debateid}>
            {showAuthCheck && <AuthCheck closeModal={handleAuthCompletion} authState={authState} />}
            <article>
                <div className="card-content">
                    <img src={card.image} alt={decodeURIComponent(card.title)} onClick={openModal} />
                    <div className="content">
                        <h3 onClick={openModal}>{decodeURIComponent(card.title)}</h3>
                        <div className="tabs">
                            <button
                                onClick={() => setActiveTab('summary')}
                                className={activeTab === 'summary' ? 'active' : ''}
                            >
                                {localizer('Summary')}
                            </button>
                            <button
                                onClick={() => setActiveTab('tweets')}
                                className={activeTab === 'tweets' ? 'active' : ''}
                            >
                                {localizer('Tweets')}
                            </button>
                        </div>
                        {activeTab === 'summary' && (
                            <div className="fade-out" onClick={openModal}>
                                {decodeURIComponent(card.report)}
                            </div>
                        )}
                        {activeTab === 'tweets' && (
                            <ul className="tweets" onClick={(e) => e.stopPropagation()}>
                                {
                                    card.sources.map(source => (
                                        <TweetPreview tweet={source} />
                                    ))
                                }
                            </ul>
                        )}
                    </div>
                    <div className="chat">
                        <div className="chat-messages">
                            {comments?.map(comment => (<p
                                className={'chat-bubble' + (comment.isreply ? ' reply' : '')}
                                data-username={comment.username}
                                onClick={() => setReply(comment.username)}
                                key={comment.id}
                            >
                                <strong>{comment.username}:</strong> {decodeURIComponent(comment.text)}
                            </p>))}
                        </div>
                        <div className="input-block">
                            <input
                                type="text"
                                placeholder={localizer('Type a message...')}
                                value={chatValue}
                                onInput={handleChatChange}
                                disabled={loading}
                            />
                            <button onClick={requestSendMessage} disabled={loading}>{localizer('Send')}</button>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
}