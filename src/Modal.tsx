import Card from "./CardBlock";
import {Auth, Debate} from "./types";
import {useEffect, useState} from "react";

interface Props {
    debate: Debate;
    closeModal: () => void;
}

export default function Modal(
    {
        debate,
        closeModal,
    }: Props
) {
    useEffect(() => {
        window.onclick = function(event) {
            if ((event.target as HTMLElement).id === 'modal') {
                closeModal();
            }
        }
    }, []);

    const authState = useState<Auth | null>(null);

    return (
        <div id="modal" className="modal">
            <div className="modal-content">
                <span className="close" onClick={closeModal}>&times;</span>
                <div id="modal-article">
                    <Card card={debate} authState={authState} />
                </div>
            </div>
        </div>
    );
}