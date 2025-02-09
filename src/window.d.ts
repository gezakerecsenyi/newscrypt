import {Debate} from "./types";

declare global {
    interface Window { data: { debates: Debate[] } }
}