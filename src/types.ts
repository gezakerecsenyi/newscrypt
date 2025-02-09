export interface Comment {
    fromUsername: string;
    text: string;
    onPost: string;
    isReply: boolean;
    id: string;
}

export interface Debate {
    title: string;
    report: string;
    image: string;
    id: string;
    comments: Comment[];
}

export interface User {
    id: string;
    username: string;
    passwordHash: string;
    faceHash: string;
}

export interface PrevFace {
    id: string;
    fromUser: string;
    faceHash: string;
}

export interface UserToken {
    id: string;
    fromUser: string;
    token: string;
    createdAt: number;
}
