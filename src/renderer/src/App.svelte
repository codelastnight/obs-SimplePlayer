<script lang="ts">
import { Socket, io } from 'socket.io-client';
import { onMount } from 'svelte';
import { sortDefault, sortByArtist, sortByDate, sortByTitle } from './helpers';
import {
    serverState,
    song,
    activePlaylist,
    concertMode,
    settings,
    ribbitText
} from './store';
import { Modals, closeModal } from 'svelte-modals';

import Playlist, { onPlaylistAdd } from './Playlist.svelte';
import Settings from './Options.svelte';
import Player, { ClientSong } from './Player.svelte';
import ObsSettings from './components/OBSSettings.svelte';
import Titlebar from './Titlebar.svelte';
import { fade } from 'svelte/transition';
import StandbyMode from './StandbyMode.svelte';

const eAPI = window.api;
const type = 'track';
let socket: Socket;

let playlist: ClientSong[] = [];
let path = '';
//let song: ClientSong;
//let songPlaying = false;

function startServerConnection() {
    // connect to server
    socket = io('http://localhost:9990', {});

    socket.on('onload', function () {
        socket.emit('whoiam', 'sender');
    });
    socket.on('whouare', function () {
        serverState.set('ready');
    });
    socket.on('disconnect', function () {
        serverState.set('disconnect');
    });
    socket.on('connect_error', function () {
        serverState.set('disconnect');
    });
    socket.on('ask4update', function (msg) {
        if (msg === 'pls') updateOBS();
    });
}

onMount(() => {
    async function checkSettings() {
        const getpath = await eAPI.dataGet(type);

        if (!!getpath && getpath.type === 'ok') {
            if (!getpath.data) return;
            eAPI.handleScanDir(type, getpath.data);
            path = getpath.data;
            window.api.getRibbitText(path);
        }
        const getSettings = await eAPI.dataGet('settings');
        if (!!getSettings && getSettings.type === 'ok') {
            if ('frogMode' in getSettings.data) settings.set(getSettings.data);
            if ('frogMode' in getSettings.data) console.log('got settings');
        }
    }

    startServerConnection();

    checkSettings();
});
window.api.onRibbitTextGet((e, data) => {
    if (data.type !== 'ok') return;

    ribbitText.set(data.data);
});

let obsSettingData;
$: obsSettingData, updateOBS();
$: $song, updateOBS();
function updateOBS() {
    if (!socket) return;

    const artist = $song?.artist || '';
    socket.emit('update', {
        ...obsSettingData,
        artist: artist
    });
}

eAPI.handleSortChange((_, arg) => {
    if (!playlist) return;
    const i = $song.index;

    if (arg.items[0].checked)
        playlist = sortByDate(playlist, arg.items[6].checked);
    else if (arg.items[1].checked)
        playlist = sortByTitle(playlist, arg.items[6].checked);
    else if (arg.items[2].checked)
        playlist = sortByArtist(playlist, arg.items[6].checked);
    else if (arg.items[3].checked)
        playlist = sortDefault(playlist, arg.items[6].checked);

    song.set(playlist.find((x) => x.index == i));
});

eAPI.onPlaylistChanged(async (_, data) => {
    if (data.type !== type) return;

    //if ($isPlaying) isPlaying.set(false);
    path = data.dir;
    if (data.loading) {
        playlist = [];
        console.log('playlist load');
    } else {
        activePlaylist.set({ type, playlist });
    }
});
eAPI.onPlaylistAdd(async (_, data) => {
    playlist = onPlaylistAdd(type, playlist, data);
});
function onModalKeyPress(e) {
    if (e.key === 'Escape') closeModal();
}
</script>

<svelte:body on:keyup={onModalKeyPress} />
<main class:nofrog={!$settings.frogMode}>
    <div class="col-span-2 h-fit">
        <Titlebar songName={$song?.title} />
    </div>

    <section class="relative w-full h-full flex flex-col overflow-y-hidden">
        <Playlist bind:playlist {path} type="track" />
        <StandbyMode />
    </section>
    <section
        class="flex flex-col h-full w-full pb-3 py-3 px-3 items-center justify-between"
        class:concertmode={$concertMode}
    >
        <div class="flex gap-x-2 justify-end w-full items-center">
            <ObsSettings
                song={$song}
                on:update={(e) => (obsSettingData = e.detail)}
            />
        </div>

        <Player />

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

        --frog-concert: url('/concert.png');
        /* ... */
    }
}
.nofrog {
    --frog-concert: rgba(0, 0, 0, 0);
}
body {
    @apply h-full bg-primary text-stone-100;
}
html {
    @apply h-full;
}
main {
    @apply grid h-full w-full grid-cols-2 gap-x-2;
    grid-template-rows: auto 1fr;
}
.concertmode {
    background-size: 60%;
    background-image: linear-gradient(
            to bottom,
            rgba(22, 29, 19, 0.8),
            rgba(22, 29, 19, 0.8)
        ),
        var(--frog-concert);
}
</style>
