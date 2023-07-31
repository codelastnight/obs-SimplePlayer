import { Writable, writable } from 'svelte/store';
import { ClientSong } from './Player.svelte';

export const state = writable('init');

export const concertMode = writable(false);

export const song: Writable<ClientSong> = writable();

export const isPlaying = writable(false);
