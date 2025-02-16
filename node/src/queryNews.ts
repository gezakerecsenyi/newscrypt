import {DateString, LangCode} from "./queryTwitter";

export type NewsCategory = 'general' | 'science' | 'sports' | 'business' | 'health' | 'entertainment' | 'tech' | 'politics' | 'food' | 'travel';

export interface NewsArticle {
    uuid: string;
    title: string;
    description: string;
    keywords: string;
    snippet: string;
    url: string;
    image_url: string;
    language: LangCode;
    published_at: string;
    source: string;
    categories: NewsCategory[];
    relevance_score: number;
    locale: string;
}

export interface NewsResponse {
    meta: {
        found: number,
        returned: number,
        limit: number,
        page: number,
    };
    data: NewsArticle[];
}

export default async function queryNews(query: string, language?: LangCode, startDate?: DateString) {
    return await (await fetch(`https://api.thenewsapi.com/v1/news/top?api_token=SXmvnFPPeGRkuDBSAXUhnyG277WKNMPjhRLYaRkx&search=${encodeURIComponent(query)}${language ? `&language=${language}` : ''}${startDate ? `&published_after=${startDate}` : ''}`)).json() as NewsResponse;
}