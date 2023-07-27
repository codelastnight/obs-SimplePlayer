<script context="module" lang="ts">
import type { Song } from '../../main/parseMetadata';

export interface ClientSong extends Song {
    // name: string;
    howl: Howl;
    index: number;
}
</script>

<script lang="ts">
import { Howl } from 'howler';

export let playlist: ClientSong[];
export let song: ClientSong;
export let isPlaying = false;

let timer = '--:--';
let duration = '--:--';

let offsetWidth;
let progressWidth = 0;

let prevSong: ClientSong;

$: playlist, onPlaylistSet();
$: if (isPlaying) {
    if (song) play();
} else {
    if (song) pause();
}

function onPlaylistSet() {
    if (!playlist) return;
    console.log(playlist);
    if (isPlaying) {
        pause();
        isPlaying = false;
    }
}
$: onSongChange(song);
function onSongChange(nextSong: ClientSong) {
    if (prevSong?.howl) prevSong.howl.stop();
    prevSong = nextSong;
}

let playInterval;

function setPlayAnimation() {
    playInterval = setInterval(() => {
        const sound = song.howl;
        if (!sound) return;

        const seek = sound.seek() || 0;
        timer = formatTime(Math.round(seek));
        progressWidth = (seek / sound.duration()) * 100 || 0;
    }, 100);
}
function formatTime(secs: number) {
    const minutes = Math.floor(secs / 60) || 0;
    const seconds = secs - minutes * 60 || 0;

    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

function play() {
    const data = song;

    if (!data.howl) {
        data.howl = new Howl({
            src: [data.filePath],
            html5: true,
            onplay: function () {
                duration = formatTime(Math.round(data.howl.duration()));

                setPlayAnimation();
            },
            onend: function () {
                skipNext();
            }
        });
    }
    data.howl.play();
    setPlayAnimation();
}
function pause() {
    const sound = song.howl;
    if (!sound) return;

    clearInterval(playInterval);
    sound.pause();
}

function skipNext() {
    if (!playlist || !song) return;
    const currentIndex = playlist.findIndex(
        (item) => item.filePath === song.filePath
    );
    let i = currentIndex + 1;
    if (i >= playlist.length) {
        i = 0;
    }
    song = playlist[i];
}
function seek(time) {
    var sound = song.howl;
    if (!sound) return;

    sound.seek(sound.duration() * time);
    if (sound.playing()) setPlayAnimation();
}

function seekToTime(event) {
    seek(event.offsetX / offsetWidth);
}
</script>

<style>
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

<div class="w-full">
    <div class=" flex justify-between w-full">
        <div id="timer">{timer}</div>
        <div id="duration">{duration}</div>
    </div>

    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
        class="progress bg-slate-500 overflow-hidden rounded-full"
        id="seek"
        bind:clientWidth={offsetWidth}
        on:click={(e) => seekToTime(e)}
    >
        <div
            class="progress-bar bg-danger bg-emerald-300 h-full rounded-full"
            role="progressbar"
            style={`width: ${progressWidth}%`}
            aria-valuemin={0}
            aria-valuemax={100}
        />
    </div>
</div>
