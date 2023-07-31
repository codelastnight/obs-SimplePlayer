<script context="module" lang="ts">
import type { Song } from '../../main/parseMetadata';
export interface ClientSong extends Song {
    // name: string;
    howl?: Howl;
    index: number;
}
</script>

<script lang="ts">
import { Howl } from 'howler';
import { fade } from 'svelte/transition';

import TrackDetails from './components/TrackDetails.svelte';
import PlaybackControls from './components/PlaybackControls.svelte';
import { onDestroy } from 'svelte';
import { handleConfirm } from './components/ModalConcert.svelte';
import { song, isPlaying, activePlaylist } from './store';
//export let playlist: ClientSong[];
export let autoplay = true;

let playlist: ClientSong[] = [];

activePlaylist.subscribe((data) => {
    console.log(data.type, 'playlist set in player', data.playlist);
    playlist = data?.playlist;
});
let timer = 0;
let duration = 0;
let sound: Howl;
let Prevsound: Howl;

let offsetWidth;
$: progressWidth = Math.round((timer / duration) * 100) || 0;

// $: playlist, onPlaylistSet();
// function onPlaylistSet() {
//     if (!playlist) return;
//     if ($isPlaying) {
//         pause();
//         isPlaying.set(false);
//     }
// }

$: $song, onSongChange();
function onSongChange() {
    if (sound) {
        Prevsound = sound;

        Prevsound.fade(1, 0, 1000);
        Prevsound.off('play');
        Prevsound.off('fade');
        Prevsound.off('end');
        Prevsound.on('fade', () => {
            if (!$song) return;

            if (Prevsound === sound) return;
            Prevsound.pause();

            Prevsound.unload();
            Prevsound = sound;
        });
    }
    if (!$song) return;

    timer = 0;
    if (!!$song) loadAudio();
}

let playInterval;

function setPlayAnimation() {
    playInterval = setInterval(() => {
        if (!sound) return;

        timer = sound.seek() || 0;
    }, 200);
}

function loadAudio() {
    const currentsong = $song.title;
    sound = new Howl({
        src: [$song.filePath],
        html5: true,
        volume: 0
    });
    sound.once('load', () => {
        duration = sound.duration();
        if ($isPlaying) sound.play();
    });
    sound.on('play', () => {
        console.log('song play:', currentsong);

        duration = sound.duration();
        setPlayAnimation();
        if ($isPlaying) {
            sound.fade(0, 1, 1000);
        }
    });
    sound.on('end', () => {
        console.log('song end:', currentsong);
        skipNext();
        isPlaying.set(autoplay);
    });
    sound.on('fade', () => {
        if (!$isPlaying) {
            sound.pause();
        }
    });
}

$: if ($isPlaying) {
    if ($song) play();
} else {
    if ($song) pause();
}

function play() {
    if (!$isPlaying) return;
    if (!!$song && !sound) loadAudio();

    sound.play();
    setPlayAnimation();
}
function pause() {
    if ($isPlaying) return;

    if (!sound) return;

    clearInterval(playInterval);
    sound.fade(1, 0, 1000);
}

function skipNext() {
    if (!playlist || !$song) return;
    const currentIndex = playlist.findIndex(
        (item) => item.filePath === $song.filePath
    );
    console.log('skipnext:', playlist, currentIndex);
    let i = currentIndex + 1;
    if (i >= playlist.length) {
        i = 0;
    }
    song.set(playlist[i]);
}
function skipPrev() {
    if (!playlist || !$song) return;

    const currentIndex = playlist.findIndex(
        (item) => item.filePath === $song.filePath
    );
    let i = currentIndex - 1;
    if (i < 0) {
        i = playlist.length - 1;
    }
    song.set(playlist[i]);
}

function seek(time) {
    if (!sound) return;
    const seek = sound.duration() * time;
    const timestamp = formatTime(Math.round(seek));
    handleConfirm('skip to: ' + timestamp, () => {
        sound.seek(seek);
        if (sound.playing()) setPlayAnimation();
        else timer = seek;
    });
}

function seekToTime(event) {
    seek(event.offsetX / offsetWidth);
}
function formatTime(secs: number) {
    const rounded = Math.round(secs);
    const minutes = Math.floor(rounded / 60) || 0;
    const seconds = rounded - minutes * 60 || 0;

    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

onDestroy(() => {
    clearInterval(playInterval);
    if (!!sound) sound.unload();
});
</script>

<div class="player">
    <div class="justify-self-start w-full">
        <TrackDetails song={$song} />
    </div>

    <div class="px-2 w-full">
        <PlaybackControls
            on:prevSong={skipPrev}
            on:nextSong={skipNext}
            disabled={!$song}
        />
    </div>
    {#if $isPlaying}
        <div
            class="flex pointer-events-none absolute z-400"
            transition:fade={{ duration: 1000 }}
        >
            <img src="Froge.gif" class=" left-1/3" alt="frog dance" />
            <img src="frogmusicnotes.gif" alt="frog dance 2" />
        </div>
    {/if}
    <div class="w-full">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
            class="progress bg-slate-500 overflow-hidden rounded-full cursor-pointer"
            id="seek"
            bind:clientWidth={offsetWidth}
            on:click={(e) => seekToTime(e)}
            role=""
        >
            <div
                class="progress-bar bg-danger bg-emerald-300 h-full rounded-full"
                role="progressbar"
                style={`width: ${progressWidth}%`}
                aria-valuemin={0}
                aria-valuemax={100}
            />
        </div>
        <div class=" flex justify-between w-full">
            <div id="timer">{formatTime(timer)}</div>
            <div id="duration">{formatTime(duration)}</div>
        </div>
    </div>
</div>

<style lang="postcss">
.player {
    @apply mt-8 grid h-full w-full w-full gap-6;
    grid-template-rows: 1fr auto auto auto;
}
.progress .progress-bar {
    -webkit-transition: none;
    -o-transition: none;
    transition: none;
}
.progress {
    margin: 2%;
    height: 10px;
}
</style>
