<script lang="ts">
import { Socket, io } from 'socket.io-client';
import { onMount } from 'svelte';
import { sortDefault, sortByArtist, sortByDate, sortByTitle } from './helpers';
import { state } from './store';
import { Modals, closeModal } from 'svelte-modals';

import Playlist from './Playlist.svelte';
import Settings from './Settings.svelte';
import Player, { ClientSong } from './Player.svelte';
import ObsSettings from './components/OBSSettings.svelte';
import Titlebar from './Titlebar.svelte';
import { fade } from 'svelte/transition';

const eAPI = window.api;

let socket: Socket;

let playlist: ClientSong[] = [];
let song: ClientSong;
let songPlaying = false;

let obsSettingData;
$: obsSettingData, updateOBS();

onMount(() => {
    // connect to server
    socket = io('http://localhost:9990', {});

    socket.on('onload', function () {
        socket.emit('whoiam', 'sender');
    });
    socket.on('whouare', function () {
        state.set('ready');
    });
    socket.on('disconnect', function () {
        state.set('disconnect');
    });
    socket.on('connect_error', function () {
        state.set('disconnect');
    });
    socket.on('ask4update', function (msg) {
        if (msg === 'pls') {
            updateOBS();
        }
    });
});

function updateOBS() {
    if (!socket) return;

    const artist = song?.artist || '';
    socket.emit('update', {
        ...obsSettingData,
        artist: artist
    });
}

eAPI.handleSortChange((_, arg) => {
    if (!playlist) return;
    const i = song.index;

    if (arg.items[0].checked)
        playlist = sortByDate(playlist, arg.items[6].checked);
    else if (arg.items[1].checked)
        playlist = sortByTitle(playlist, arg.items[6].checked);
    else if (arg.items[2].checked)
        playlist = sortByArtist(playlist, arg.items[6].checked);
    else if (arg.items[3].checked)
        playlist = sortDefault(playlist, arg.items[6].checked);

    song = playlist.find((x) => x.index == i);
});

eAPI.onPlaylistChanged(async (_, data) => {
    if (songPlaying) songPlaying = false;

    if (!data.done) {
        playlist = [];
        console.log('playlist load');
    } else {
        song = playlist[0];
        updateOBS();
        console.log('playlist finish load');
    }
});
eAPI.onPlaylistAdd(async (_, metadata) => {
    if (!playlist) return;
    if (playlist.some((item) => item.filePath === metadata.filePath)) return;

    const i = playlist.length;

    playlist = [
        ...playlist,
        {
            ...metadata,
            howl: null,
            index: i
        }
    ];
});
eAPI.onPlaylistRemoved((_, path) => {
    if (!playlist) return;

    const remIndex = playlist.findIndex((x) => x.filePath == path);
    if (remIndex == -1) return;

    playlist.splice(remIndex, 1);
    playlist = playlist;
});

function playPlaylistSong(i: number) {
    song = playlist.find((item) => item.index === i);
}

function onModalKeyPress(e) {
    if (e.key === 'Escape') {
        // write your logic here.
        closeModal();
    }
}
</script>

<svelte:body on:keyup={onModalKeyPress} />
<main>
    <div class="col-span-2 h-fit">
        <Titlebar songName={song?.title} isPlaying={songPlaying} />
    </div>

    <section class="w-full h-full flex flex-col overflow-y-hidden pr-[10px]">
        <Playlist
            {playlist}
            {song}
            on:changeSong={(event) => playPlaylistSong(event.detail.index)}
        />
    </section>
    <section
        class="flex flex-col h-full w-full pb-3 py-3 px-3 items-center justify-between"
    >
        <div class="flex gap-x-2 justify-end w-full items-center">
            <ObsSettings
                {song}
                on:update={(e) => (obsSettingData = e.detail)}
            />
        </div>

        <Player {playlist} bind:song bind:isPlaying={songPlaying} />

        <Settings />
    </section>
</main>
<Modals>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
        slot="backdrop"
        class="fixed inset-0 bg-stone-900/70"
        transition:fade={{ duration: 150 }}
        on:click={closeModal}
    />
</Modals>

<style global lang="postcss">
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
    :root {
        --primary: 22 29 19;
        /* ... */
    }
}
body {
    @apply h-full bg-primary text-stone-100;
}
html {
    @apply h-full;
}
main {
    @apply grid h-full w-full grid-cols-2;
    grid-template-rows: auto 1fr;
}
</style>
