import { Writable, writable } from 'svelte/store';
import { ClientSong } from './Player.svelte';
import { listType } from '../../main';

export const serverState = writable('init');

export const concertMode = writable(false);

export const song: Writable<ClientSong> = writable();

export const isPlaying = writable(false);

interface activePlaylistData {
    playlist: ClientSong[];
    type: listType;
}
export const activePlaylist: Writable<activePlaylistData> = writable({
    type: 'none',
    playlist: []
});
