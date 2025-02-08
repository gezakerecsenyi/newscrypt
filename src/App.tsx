import React, {useEffect, useState} from 'react';
import './App.css';
import Header from "./Header";
import Footer from "./Footer";
import {Debate} from "./types";
import Card from './Card';

function App() {
    const [debates, setDebates] = useState<Debate[]>(window.debates);

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
                }
            }, 100);
        });
    }, []);

    return (
        <div className="App">
            <Header/>
            <main>
                {
                    debates.map(debate => <Card card={debate} />)
                }
            </main>
            <Footer />
        </div>
    );
}

export default App;
