import {Debate} from "./types";

declare global {
    interface Window { debates: Debate[] }
}