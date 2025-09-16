import mongoose, { Schema } from 'mongoose';

const baseOptions = {
    discriminatorKey: 'type',
    collection: 'decks'
}
export enum DecksType { ROOT = 'root', SUB = 'sub' }

const decksSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    depth: {
        type: Number,
        required: true
    },
    ownerDocID: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    savedPostDocIDs: {
        type: [Schema.Types.ObjectId],
        ref: 'posts',
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
}, baseOptions);

decksSchema.post('aggregate', async function (docs) {
    try {
        if (docs.length !== 0) {
            for (const doc of docs) {
                doc["deckID"] = doc._id
                const subDecks = doc["subDecks"]
                if (subDecks && subDecks.length !== 0) {
                    subDecks.map(deck => deck["deckID"] = deck._id)
                }
            }
        }
    } catch (error) {
        console.error(error)
    }
})

const decksModel = mongoose.model('decks', decksSchema);

const rootDecksSchema = new Schema({});
const rootDecksModel = decksModel.discriminator(DecksType.ROOT, rootDecksSchema);

const subDecksSchema = new Schema({
    parentDeckID: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'decks'
    }
});
const subDecksModel = decksModel.discriminator(DecksType.SUB, subDecksSchema);


export { decksModel, rootDecksModel, subDecksModel }; 