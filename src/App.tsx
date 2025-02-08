import React, {useEffect, useState} from 'react';
import './App.css';
import Header from "./Header";
import Footer from "./Footer";
import {Debate} from "./types";
import Card from './Card';

function App() {
    const [debates, setDebates] = useState<Debate[]>(window.debates);

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
