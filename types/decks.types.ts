import { DecksType } from './../backend/schemas/decks.model';
import { PostType } from './post.types';
export interface MyDeckType {
    deckID: string,
    title: string,
    createdAt: string,
    parentDeckID: string | null,
    type: DecksType,
    subDecks: MyDeckType[] | null,
    savedPosts: PostType[]
}
