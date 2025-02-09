import React, {useEffect, useState} from 'react';
import './App.css';
import Header from "./Header";
import Footer from "./Footer";
import {Debate, User} from "./types";
import Card from './CardBlock';
import Modal from "./Modal";

function App() {
    const [debates, setDebates] = useState<Debate[]>(window.data.debates);
    const [currentCard, setCurrentCard] = useState(window.data.debates[0]?.debateid || '');

    useEffect(() => {
        let isScrolling: NodeJS.Timeout;
        const headerHeight = document.querySelector('header')!.getBoundingClientRect().height;
        window.addEventListener('scroll', () => {
            window.clearTimeout(isScrolling);
            isScrolling = setTimeout(() => {
                const cards = document.querySelectorAll('.card') as NodeListOf<HTMLDivElement>;
                let closestCard: HTMLDivElement = cards[0];
                let closestDistance = Infinity;

                cards.forEach(card => {
                    const cardTop = card.getBoundingClientRect().top + window.scrollY;
                    const distance = Math.abs(window.scrollY - cardTop);

                    if (distance < closestDistance) {
                        closestCard = card;
                        closestDistance = distance;
                    }
                });

                if (closestCard) {
                    const y = closestCard.getBoundingClientRect().top + window.scrollY - headerHeight;
                    window.scrollTo({top: y, behavior: 'smooth'});
                    setCurrentCard(closestCard.id);
                    window.setTimeout(() => {
                        window.location.hash = closestCard.id;
                    }, 200);
                }
            }, 100);
        });
    }, []);

    useEffect(() => {
        if (window.location.hash) {
            document.getElementById(window.location.hash)!.scrollIntoView({behavior: 'smooth'});
        }
    }, []);

    const [modalDebate, setModalDebate] = useState<Debate | null>(null);
    const authState = useState<User | null>(window.data.currentUser);

    return (
        <div className="App">
            <Header authState={authState} />
            <main>
                {
                    debates.map(debate => <Card
                        card={debate}
                        key={debate.debateid}
                        openModal={() => setModalDebate(debate)}
                        authState={authState}
                    />)
                }
            </main>
            <Footer />

            {
                modalDebate && <Modal debate={modalDebate} closeModal={() => setModalDebate(null)} />
            }
        </div>
    );
}

export default App;
