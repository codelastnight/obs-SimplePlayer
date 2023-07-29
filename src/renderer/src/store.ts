import { writable } from 'svelte/store';


export const state = writable('init');

export const concertMode = writable(false);