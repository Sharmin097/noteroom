import { rootDecksModel, subDecksModel, decksModel, DecksType } from "../schemas/decks.model";
import UsersModel from "../schemas/users.model";
import mongoose from "mongoose";

export async function addRootDeck(deckData: any) {
    const context = addRootDeck.name
    try {
        const deck = await rootDecksModel.create(deckData)
        return { ok: true, deck: deck, context }
    } catch (error) {
        return { ok: false, error: error, context }
    }
}

export async function getRootDeck(root_deck_id: any, ownerDocID: any) {
    const context = getRootDeck.name
    try {
        const data = await rootDecksModel.findOne({
            _id: root_deck_id,
            ownerDocID
        });
        return { ok: true, data: data, context }
    } catch (error) {
        return { ok: false, error: error, context }
    }
}

export async function addSubDeck(deckData: any) {
    const context = addSubDeck.name
    try {
        const deck = await subDecksModel.create(deckData)
        return { ok: true, deck: deck, context }
    } catch (error) {
        return { ok: false, error: error, context }
    }
}

export async function getDeck(deck: any, ownerDocID: any) {
    const context = getDeck.name
    try {
        const data = await decksModel.findOne({
            _id: deck,
            ownerDocID
        })
        return { ok: true, deck: data, context }
    } catch (error) {
        return { ok: false, error: error, context }
    }
}

export async function savePostToDeck(deck: any, ownerDocID: any, postDocID: any) {
    const context = savePostToDeck.name
    try {
        await decksModel.updateOne({ _id: deck, ownerDocID }, { $addToSet: { savedPostDocIDs: postDocID } })
        await UsersModel.updateOne({ _id: ownerDocID }, { $addToSet: { saved_notes: postDocID } })
        return { ok: true, context }
    } catch (error) {
        return { ok: false, error: error, context }
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
