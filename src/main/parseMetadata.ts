import { parseFile } from 'music-metadata';
import { statSync } from 'fs';
import { sep } from 'path'
export interface Song {
    filePath: string;
    title: string;
    artist?: string;
    album?: string;

    modDate?: Date;

}
const defaultEntry: Song = {
    title: 'unkown song',
    artist: 'unkown :(',
    album: 'unkown',
    filePath: '',
    modDate: new Date
}
export async function parseMetadataFiles(audioFiles: string[]) {

    const promiseList = audioFiles.map((file) => parseMetadata(file))
    let titles = await Promise.all(promiseList)

    return titles;
}
export async function parseMetadata(audioFile: string) {
    // await will ensure the metadata parsing is completed before we move on to the next file
    const result = await parseFile(audioFile, { skipCovers: true })
        .catch((err) => { console.error(err); return null });
    if (!result) return defaultEntry;

    const metadata = result.common
    const stats = statSync(audioFile);
    const title = metadata.title
        ? metadata.title
        : audioFile.split(sep).slice(-1)[0];
    const artist = metadata.artist ? metadata.artist : '';
    const album = metadata.album ? metadata.album : '';

    const modDate = stats.mtime;


    return { filePath: audioFile, title, artist, modDate, album } as song;
}


