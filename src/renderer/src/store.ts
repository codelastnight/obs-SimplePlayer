import { Writable, writable } from 'svelte/store';
import { ClientSong } from './Player.svelte';
import { listType } from '../../main/registerIpc';

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

const settingsDefault = {
    frogMode: true,
    fade: true,
    fadeValue: 1000,
    standby: {
        autoplay: true,
        shuffle: false
    },
    track: {
        autoplay: false,
        shuffle: false
    }
};
export type Settings = typeof settingsDefault;
export const settings: Writable<Settings> = writable(settingsDefault);

export const currentTracks: Writable<string[]> = writable([]);
export const ribbitText: Writable<string[]> = writable([]);
