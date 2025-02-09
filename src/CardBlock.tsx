import { Auth, Debate } from "./types";
import { FormEvent, useCallback, useState } from "react";
import AuthCheck from "./AuthCheck";
import TweetPreview from "./TweetPreview";

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

    const [activeTab, setActiveTab] = useState('summary');

    return (
        <div className="card" id={card.id}>
            {showAuthCheck && <AuthCheck closeModal={handleAuthCompletion} />}
            <article>
                <div className="card-content">
                    <img src={card.image} alt={card.title} onClick={openModal} />
                    <div className="content">
                        <h3 onClick={openModal}>{card.title}</h3>
                        <div className="tabs">
                            <button
                                onClick={() => setActiveTab('summary')}
                                className={activeTab === 'summary' ? 'active' : ''}
                            >
                                Summary
                            </button>
                            <button
                                onClick={() => setActiveTab('tweets')}
                                className={activeTab === 'tweets' ? 'active' : ''}
                            >
                                Tweets
                            </button>
                        </div>
                        {activeTab === 'summary' && (
                            <div className="fade-out" onClick={openModal}>
                                {card.report}
                            </div>
                        )}
                        {activeTab === 'tweets' && (
                            <ul className="tweets" onClick={(e) => e.stopPropagation()}>
                                <TweetPreview tweet={{url: 'abc', user: 'elonmusk', text: 'OMG! Crypto is awfuL!'}}/>
                                <TweetPreview tweet={{url: 'abc', user: 'trump', text: 'OMG! Crypto is awfuLfehfeuhfeu huefhufheuhf hefuhe wihohq bkjfqqrhu qhpoqirw joijfiew jwfij ijefij!'}}/>
                                <TweetPreview tweet={{url: 'abc', user: 'obama', text: 'OMG! Crypto is the bestest bestest bestest bestest bestest bestest bestest bestest bestest bestest bestest bestest bestest bestest !'}}/>
                            </ul>
                        )}
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
            <style>{`
                .card {
                    font-family: 'Fira Mono', monospace;
                }
                .tabs {
                    display: flex;
                    justify-content: space-around;
                    margin-bottom: 1rem;
                    gap: 0.5rem;
                }
                .tabs button {
                    flex: 1;
                    padding: 0.5rem 1rem;
                    border: none;
                    background: #333;
                    cursor: pointer;
                    transition: background 0.3s, color 0.3s;
                    font-size: 0.875rem;
                    font-weight: bold;
                    color: #bbb;
                    border-radius: 0.5rem;
                    font-family: 'Fira Mono', monospace;
                }
                .tabs button.active {
                    background: #555;
                    color: white;
                    border-bottom: none;
                }
                .tabs button:not(.active):hover {
                    background: #444;
                }
                .tweets {
                    list-style: none;
                    padding: 0;
                }
                .tweets li {
                    margin-bottom: 0.5rem;
                }
                .tweets a {
                    color: #1DA1F2;
                    text-decoration: none;
                }
                .tweets a:hover {
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
}