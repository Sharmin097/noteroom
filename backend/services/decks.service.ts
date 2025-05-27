import { rootDecksModel, subDecksModel, decksModel, DecksType } from "../schemas/decks.model";
import UsersModel from "../schemas/users.model";
import mongoose from "mongoose";

export async function addRootDeck(deckData: any) {
    try {
        const deck = await rootDecksModel.create(deckData)
        return { ok: true, deck: deck }
    } catch (error) {
        return { ok: false, error: error }
    }
}

export async function getRootDeck(root_deck_id: any, ownerDocID: any) {
    try {
        const data = await rootDecksModel.findOne({
            _id: root_deck_id,
            ownerDocID
        });
        return { ok: true, data: data }
    } catch (error) {
        return { ok: false, error: error }
    }
}

export async function addSubDeck(deckData: any) {
    try {
        const deck = await subDecksModel.create(deckData)
        return { ok: true, deck: deck }
    } catch (error) {
        return { ok: false, error: error }
    }
}

export async function getDeck(deck: any, ownerDocID: any) {
    try {
        const data = await decksModel.findOne({
            _id: deck,
            ownerDocID
        })
        return { ok: true, deck: data }
    } catch (error) {
        return { ok: false, error: error }
    }
}

export async function savePostToDeck(deck: any, ownerDocID: any, postDocID: any) {
    try {
        await decksModel.updateOne({ _id: deck, ownerDocID }, { $addToSet: { savedPostDocIDs: postDocID } })
        await UsersModel.updateOne({ _id: ownerDocID }, { $addToSet: { saved_notes: postDocID } })
        return { ok: true }
    } catch (error) {
        return { ok: false, error: error }
    }
}


/**
* @param {mongoose.Types.ObjectId} options.parentDeckID
* @description - If the parentDeckID is set, its going to give all the subdecks of that parent(root) decks
*/
export async function getDecks(ownerDocID: string, type?: DecksType, options?: { parentDeckID?: string }) {
    try {
        const decks = await decksModel.aggregate([
            {
                $match: {
                    ownerDocID: new mongoose.Types.ObjectId(ownerDocID),
                    ...(type && { type: type }),
                    ...(options?.parentDeckID && { parentDeckID: new mongoose.Types.ObjectId(options.parentDeckID) })
                }
            },
        ])
        return { ok: true, decks: decks }
    } catch (error) {
        return { ok: false, error }
    }
}

export async function getSingleDeck(deckDocID: string, ownerDocID: string) {
    try {
        const deck = await decksModel.aggregate([
            {
                $match: {
                    ownerDocID: new mongoose.Types.ObjectId(ownerDocID),
                    _id: new mongoose.Types.ObjectId(deckDocID)
                }
            }
        ])
        return { ok: true, deck: deck.length !== 0 ? deck[0] : null }
    } catch (error) {
        return { ok: false, error }
    }
}
