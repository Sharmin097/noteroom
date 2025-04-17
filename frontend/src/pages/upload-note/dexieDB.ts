import Dexie from "dexie";

export const dexieDB = new Dexie("nr_drafts")
enum DexieStores { TEXT_IMAGE="content", LINK="link", FILE="file", MCQ="mcq" }

dexieDB.version(2).stores({
    [DexieStores.TEXT_IMAGE]: "postID, title, description, images, type",
    [DexieStores.LINK]: "postID, title, links, type",
    [DexieStores.FILE]: "postID, title, description, files, type",
    [DexieStores.MCQ]: "postID, title, mcqs, type",
})

export async function getAllDrafts() {
    let draftObjects = {};
    await Promise.all(
        dexieDB.tables.map(async table => {
        const drafts = await table.toArray()
        draftObjects[table.name] = drafts
        })
    )
    return Object.values(draftObjects).flat()
}
