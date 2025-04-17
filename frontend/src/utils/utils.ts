import JSZip from "jszip"
import { saveAs } from "file-saver"

export default async function downloadPostZip(folderName: string, fileLinks: string[]) {
    try {
        const getFileName = (url: string) => ((new URL(url).pathname).split('/').pop())
        const toVirtualHostedStyleURL = (url: string) => url.replace(/^https:\/\/storage\.googleapis\.com\/([^/]+)\/(.+)$/, (_, b, p) => `https://${b}.storage.googleapis.com/${p}`);

        const zip = new JSZip()
        const imageFolder = zip.folder("images")
        
        for (const url of fileLinks) {
            const response = await fetch(toVirtualHostedStyleURL(url))
            const blob = await response.blob()
            imageFolder?.file(`${getFileName(url)}`, blob)
        }
    
        const zipBlob = await zip.generateAsync({ type: "blob" })
        saveAs(zipBlob, `${folderName.slice(0, 50).split(" ").join("-")}.zip`)

        return true
    } catch (error) {
        return false
        console.error(error)
    }
}
