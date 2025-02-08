import Card from "./Card";
import {Debate} from "./types";
import {useEffect} from "react";

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

    return (
        <div id="modal" className="modal">
            <div className="modal-content">
                <span className="close" onClick={closeModal}>&times;</span>
                <div id="modal-article">
                    <Card card={debate} />
                </div>
            </div>
        </div>
    );
}