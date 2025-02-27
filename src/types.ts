import {TwitterPost} from "../node/src/queryTwitter";

export interface Comment {
    username: string;
    text: string;
    onpost: string;
    isreply: boolean;
    id: string;
}

export interface DebateSource {
    username: string;
    text: string;
    url: string;
}

export interface Debate {
    title: string;
    report: string;
    image: string;
    debateid: string;
    comments: Comment[];
    sources: DebateSource[];
}

export interface User {
    id: string;
    username: string;
    passwordhash: string;
    faceHash: string;
}

export interface PrevFace {
    id: string;
    fromuser: string;
    facehash: string;
}

export interface UserToken {
    id: string;
    fromuser: string;
    token: string;
    createdat: number;
}
