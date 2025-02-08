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