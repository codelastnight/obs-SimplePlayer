<script lang="ts">
import { io } from 'socket.io-client';
import { onMount } from 'svelte';
import { sortDefault, sortByArtist, sortByDate, sortByTitle } from './helpers';
import { Howler } from 'howler';

import Playlist from './Playlist.svelte';
import TrackDetails from './TrackDetails.svelte';
import PlaybackControls from './PlaybackControls.svelte';
import Settings from './Settings.svelte';
import Player, { ClientSong } from './Player.svelte';
import Fa from 'svelte-fa';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import ObsSettings from './OBSSettings.svelte';
import ObsStatusChip from './ObsStatusChip.svelte';

import frog1 from './static/Froge.gif?asset';
import frog2 from './static/frogmusicnotes.gif?asset';

const eAPI = window.api;
const socket = io('http://localhost:9990', {});

let state = 'init';

socket.on('onload', function () {
    socket.emit('whoiam', 'sender');
});
socket.on('whouare', function () {
    state = 'ready';
});
socket.on('disconnect', function () {
    state = 'disconnect';
});

socket.on('ask4update', function (msg) {
    if (msg === 'pls') {
        updateOBS();
    }
});

let trackName = '';
let trackArtist = '';
let trackAlbum = '';
let songPlaying = false;
let obsVisible = false;
let loading = false;

let player = null;
let playlist: ClientSong[];
let song: ClientSong;

let mute = false;
let slider = 100;

let obsSettingData;
$: obsSettingData, updateOBS();
onMount(() => {
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
    socket.emit('update', {
        ...obsSettingData,
        artist: trackArtist
    });
}

eAPI.handleSortChange((event, arg) => {
    if (player) {
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
    }
});
eAPI.handleSaveSetting((_, data) => {
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
    getTags(song.filePath);
    loading = false;
});
eAPI.handlePlaylistAdd((_, path) => {
    addSongToPlaylist(path);
});
eAPI.handlePlaylistRemove((_, path) => {
    removeSongFromPlaylist(path);
});

async function addSongToPlaylist(path) {
    if (!player) return;

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
}

function removeSongFromPlaylist(path) {
    if (!player) return;

    const remIndex = playlist.findIndex((x) => x.filePath == path);
    if (remIndex == -1) return;

    playlist.splice(remIndex, 1);
    playlist = playlist;
}

async function getTags(audioFile) {
    const { title, artist, album } = await eAPI.parseMetadata(audioFile);

    trackName = title;
    trackArtist = artist;

    trackAlbum = album;
    updateOBS();
}

function playPlaylistSong(i: number) {
    song = playlist.find((item) => item.index === i);
    songPlaying = true;
}

function skipNext() {
    const currentIndex = playlist.findIndex(
        (item) => item.filePath === song.filePath
    );
    let i = currentIndex + 1;
    if (i >= playlist.length) {
        i = 0;
    }
    song = playlist[i];
}
function skipPrev() {
    const currentIndex = playlist.findIndex(
        (item) => item.filePath === song.filePath
    );
    let i = currentIndex - 1;
    if (i < 0) {
        i = playlist.length - 1;
    }
    song = playlist[i];
}
function showPlaylist() {
    obsVisible = !obsVisible;
}

function playMusic() {
    if (songPlaying) {
        songPlaying = false;
    } else {
        songPlaying = true;
        getTags(song.filePath);
    }
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
    @apply bg-slate-900 h-full text-white;
}
html {
    @apply h-full;
}
</style>

<main class="grid grid-cols-2 py-3 px-3 w-full h-full">
    {#if obsVisible}
        <ObsSettings
            {trackName}
            on:update={(e) => (obsSettingData = e.detail)}
            on:close={() => (obsVisible = false)}
        />
    {/if}
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
                on:changeSong={(event) => playPlaylistSong(event.detail.index)}
            />
        {/if}
    </section>

    <section
        class="flex flex-col h-full w-full pb-6 items-center justify-between"
    >
        <div class="flex gap-x-2 self-end justify-between w-full">
            <ObsStatusChip {state} />
            <button
                type="button"
                on:click={showPlaylist}
                class="rounded-full gap-x-2 px-4 py-2 flex items-center hover:bg-slate-700"
            >
                OBS Settings
                <Fa icon={faGear} />
            </button>
        </div>
        {#if songPlaying}
            <div class="flex pointer-events-none">
                <img src={frog1} class="absolute left-1/3" alt="frog dance" />
                <img src={frog2} alt="frog dance 2" />
            </div>
        {/if}
        <div class="flex flex-col h-full w-full justify-between my-8">
            <div>
                <TrackDetails {trackName} {trackArtist} {trackAlbum} />
            </div>

            <div class="px-2">
                <PlaybackControls
                    on:prevSong={skipPrev}
                    on:nextSong={skipNext}
                    on:playMusic={playMusic}
                    {songPlaying}
                />
                <Player {playlist} bind:song bind:isPlaying={songPlaying} />
            </div>
        </div>

        <div class="flex items-center justify-between w-full" id="outerCtrl">
            <Settings
                on:showPlaylist={showPlaylist}
                on:togglemute={togglemute}
                bind:slider
                {mute}
            />
        </div>
    </section>
</main>
