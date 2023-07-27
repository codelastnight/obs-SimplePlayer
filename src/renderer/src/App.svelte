<script lang="ts">
import { Socket, io } from 'socket.io-client';
import { onMount } from 'svelte';
import { sortDefault, sortByArtist, sortByDate, sortByTitle } from './helpers';
import { Howler } from 'howler';
import { state } from './store';

import Playlist from './Playlist.svelte';
import Settings from './Settings.svelte';
import Player, { ClientSong } from './Player.svelte';
import ObsSettings from './OBSSettings.svelte';
import ObsStatusChip from './ObsStatusChip.svelte';
import Titlebar from './Titlebar.svelte';

const eAPI = window.api;

let socket:Socket;

let playlist: ClientSong[];
let song: ClientSong;
let songPlaying = false;

let loading = false;

let mute = false;
let slider = 100;

let obsSettingData;
$: obsSettingData, updateOBS();

onMount(() => {
    // connect to server
    socket = io('http://localhost:9990', {});

    socket.on('onload', function () {
        socket.emit('whoiam', 'sender');
    });
    socket.on('whouare', function () {
        state.set( 'ready') ;
    });
    socket.on('disconnect', function () {
        state.set( 'disconnect');
    });
    socket.on('connect_error',function (){
        state.set( 'disconnect');
    })
    socket.on('ask4update', function (msg) {
        if (msg === 'pls') {
            updateOBS();
        }
    });

    async function checkSettings() {
        const settings = await eAPI.dataGet('settings');
        const getpath = await eAPI.dataGet('path');

        if (settings !== undefined && settings.type === 'ok') {
            if (settings.data.volume) slider = settings.data.volume;
        }

        if (getpath !== undefined && getpath.type === 'ok') {
            if (getpath.data.path !== undefined)
                eAPI.handleScanDir(getpath.data.path.toString());
        }
    }

    checkSettings();
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
eAPI.handleSaveSetting((_) => {
    eAPI.dataSet({
        key: 'settings',
        value: { mute: mute, volume: slider }
    });
    eAPI.handleClosed();
});

eAPI.handleSelectedFiles(async (_, list) => {
    if (songPlaying) songPlaying = false;
    if (!list?.songList || list.songList.length === 0) return;

    const songArr: ClientSong[] = list.songList.map((song, i) => {
        return {
            ...song,
            howl: null,
            index: i
        };
    });
    playlist = songArr;
    song = playlist[0];
    updateOBS();

    loading = false;
});
eAPI.handlePlaylistAdd(async (_, path) => {
    if (!playlist) return;
    if (playlist.some((item) => item.filePath === path)) return;
    const { title, artist, modDate } = await eAPI.parseMetadata(path);
    const i = playlist.length;

    playlist = [
        ...playlist,
        {
            title: title,
            filePath: path,
            artist: artist,
            modDate: modDate,
            howl: null,
            index: i
        }
    ];
});
eAPI.handlePlaylistRemove((_, path) => {
    if (!playlist) return;

    const remIndex = playlist.findIndex((x) => x.filePath == path);
    if (remIndex == -1) return;

    playlist.splice(remIndex, 1);
    playlist = playlist;
});

function playPlaylistSong(i: number) {
    song = playlist.find((item) => item.index === i);
}

function togglemute() {
    if (mute) {
        mute = false;
        setVolume(slider / 100);
    } else {
        mute = true;
        setVolume(0);
    }
    eAPI.dataSet({ key: 'settings', value: { mute: mute, volume: slider } });
}

export function setVolume(val) {
    Howler.volume(val);
}
$: {
    setVolume(slider / 100);
    mute = false;
}
</script>

<style global lang="postcss">
@tailwind base;
@tailwind components;
@tailwind utilities;
body {
    @apply bg-violet-950 h-full text-stone-100;
   
    background: #161d13;
 
}
html {
    @apply h-full;
}
main {
    grid-template-rows: auto 1fr;
}
</style>

<main class="grid grid-cols-2 w-full h-full">
    <div class="col-span-2 h-fit">
        <Titlebar  />
    </div>

    <section class="w-full h-full flex flex-col overflow-y-hidden pr-[10px]">
        {#if loading}
            <div
                class="spinner-border text-danger centerBlock"
                style="width: 5rem; height: 5rem;"
                role="status"
            >
                <span class="sr-only">Loading...</span>
            </div>
        {:else}
            <Playlist
                {playlist}
                {song}
                on:changeSong={(event) => playPlaylistSong(event.detail.index)}
            />
        {/if}
    </section>

    <section
        class="flex flex-col h-full w-full pb-6 py-3 px-3 items-center justify-between"
    >
        <div class="flex gap-x-2 self-end justify-between w-full items-center">
            <ObsSettings
                {song}
                on:update={(e) => (obsSettingData = e.detail)}
            />
        </div>

        <Player {playlist} bind:song bind:isPlaying={songPlaying} />

        <div class="flex items-center justify-between w-full" id="outerCtrl">
            <Settings on:togglemute={togglemute} bind:slider {mute} />
        </div>
    </section>
</main>
