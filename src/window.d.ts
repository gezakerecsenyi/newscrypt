import {Debate, User} from "./types";

declare global {
    interface Window { data: { debates: Debate[], currentUser: User | null, } }
}