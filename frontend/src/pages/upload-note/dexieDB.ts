import Dexie from "dexie";
import { DraftPost, SubNav as DexieStores } from "./UploadNote";

export const dexieDB = new Dexie("NR_DRAFTS")

dexieDB.version(1).stores({
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
export async function addDraft(postType: DexieStores, post: DraftPost) {
    try {
        await dexieDB[postType].add(post)
        return true
    } catch (error) {
        return false
    }
}

export async function deleteDraft(postType: DexieStores, postID: string) {
    try {
        await dexieDB[postType].delete(postID)
        return true
    } catch (error) {
        return false
    }
}

export async function clearDraft() {
    try {
        for (const table of dexieDB.tables) {
            await table.clear()
        }
        return true
    } catch (error) {
        return false
    }
}