<script context="module" lang="ts">
import type { Song } from '../../main/parseMetadata';
export interface ClientSong extends Song {
    // name: string;
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
import {
    song,
    isPlaying,
    activePlaylist,
    settings,
    currentTracks
} from './store';
import { formatTime } from './helpers';
//export let playlist: ClientSong[];
let autoplay = true;
$: fadeDuration = $settings.fade ? $settings.fadeValue : 1;
$: console.log(fadeDuration);
let playlist: ClientSong[] = [];
$: type = $activePlaylist.type;
$: autoplay = $settings[type] ? $settings[type].autoplay : true;
$: console.log('autoplay?', autoplay);
$: onActivePlaylistSet($activePlaylist);
function onActivePlaylistSet(data) {
    playlist = data?.playlist;
    // if (data.type in $settings) {
    //     autoplay = $settings[data.type].autoplay;
    // }
    console.log(data.type, ': playlist set as active : ');
}

interface howlListProps {
    [key: string]: Howl;
}
let howlList: howlListProps = {};
let timer = 0;
let duration = 0;
// let sound: Howl;
let prevSoundPath: string;

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

$: onSongChange($song);
function onSongChange(newSongData: ClientSong) {
    if (!newSongData) return;

    unloadUnusedAudio();
    const path = newSongData.filePath;

    if (!prevSoundPath) {
        prevSoundPath = path;
    } else if (prevSoundPath !== path) {
        const prevSound =
            prevSoundPath in howlList ? howlList[prevSoundPath] : undefined;
        if (!!prevSound) {
            prevSound.fade(1, 0, fadeDuration);
            // prevSound.off('play');
            // prevSound.off('fade');
            // prevSound.off('end');
            // prevSound.on('fade', () => {
            //     // if (prevSoundPath === $song.filePath) return;
            //     prevSound.stop();

            //     prevSound.unload();
            // });
        }
        prevSoundPath = path;
    }

    if (type === 'track') window.api.getTrackList(path);

    const sound = loadAudio(path);
    sound.seek(0);
    timer = 0;
}

let playInterval: NodeJS.Timeout;

function setPlayAnimation() {
    clearTimeout(playInterval);

    playInterval = setTimeout(function tick() {
        if (!$song) return;
        const sound =
            $song.filePath in howlList ? howlList[$song.filePath] : undefined;
        timer = sound?.seek() || 0;
        setCurrentTracks(timer);
        setTimeout(tick, 200);
    }, 200);
}

function loadAudio(filePath) {
    if (filePath in howlList) return howlList[filePath];

    const howl = new Howl({
        src: [filePath],
        html5: true,
        volume: 0,
        autoplay: false
    });
    howl.once('load', () => {
        duration = howl.duration();
    });
    howl.on('play', () => {
        console.log('song started playing', filePath);
        duration = howl.duration();

        if ($isPlaying) {
            howl.fade(0, 1, fadeDuration);
        }
    });
    howl.on('end', () => {
        console.log('song ended: ', filePath);
        skipNext();
        isPlaying.set(autoplay);
    });
    howl.on('fade', () => {
        console.log('song finished fading');
        if (!$isPlaying && howl.playing()) {
            howl.pause();
        }
    });

    howlList[$song.filePath] = howl;
    return howl;
}

$: if ($isPlaying) {
    if ($song) {
        play(howlList[$song.filePath]);
    }
} else {
    if ($song) pause();
}

function play(sound: Howl) {
    if (!$isPlaying || !$song) return;
    const path = $song.filePath;
    // const sound = loadAudio(path);
    console.log('start play:', path);

    if (!sound.playing()) sound.play();

    setPlayAnimation();
}
function pause() {
    if ($isPlaying) return;
    const sound =
        $song.filePath in howlList ? howlList[prevSoundPath] : undefined;
    if (!sound) return;

    clearTimeout(playInterval);
    sound.fade(1, 0, fadeDuration);
    unloadUnusedAudio();
}

function skipNext() {
    if (!playlist || !$song) return;
    const currentIndex = playlist.findIndex(
        (item) => item.filePath === $song.filePath
    );
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
    if (!$song) return;
    const sound =
        $song.filePath in howlList ? howlList[prevSoundPath] : undefined;

    if (!sound) return;

    const seek = sound.duration() * time;
    const timestamp = formatTime(Math.round(seek));
    handleConfirm('skip to: ' + timestamp, () => {
        sound.seek(seek);
        console.log(sound.seek());
        if (sound.playing()) setPlayAnimation();
        else timer = seek || 0;
    });
}

function seekToTime(event) {
    seek(event.offsetX / offsetWidth);
}

function unloadUnusedAudio(ondestroy = false) {
    for (const [path, sound] of Object.entries(howlList)) {
        if (ondestroy) {
            sound.unload();
            continue;
        }
        if (path === prevSoundPath || path === $song.filePath) continue;

        if (sound.playing) {
            sound.stop();
        }
    }
}
let trackListData = {};
let tracklistArray = [];
//let currentTracks = [];
window.api.onTrackListGet((_, data) => {
    if (data.type !== 'ok') {
        trackListData = {};
        tracklistArray = [];
        currentTracks.set([]);
        return;
    }
    trackListData = data.data;
    tracklistArray = Object.keys(data.data).map((key) => parseInt(key));
});
function sortedIndex(array, value) {
    var low = 0,
        high = array.length;

    while (low < high) {
        var mid = (low + high) >>> 1;
        if (array[mid] < value) low = mid + 1;
        else high = mid;
    }
    return low;
}
let defer = -1;
function setCurrentTracks(currentTime: number) {
    if (!trackListData || tracklistArray.length === 0) return;
    const index = sortedIndex(tracklistArray, currentTime) - 1;
    if (index < 0) return;
    if (index === defer) return;
    defer = index;
    let current = [];
    const text = trackListData[`${tracklistArray[index]}`] as string;
    if (text.trim().startsWith('+')) {
        current = [];
        for (let i = 0; i < index + 1; i++) {
            const prevText = trackListData[`${tracklistArray[index - i]}`];

            current = [prevText, ...current];
            if (!prevText.trim().startsWith('+')) {
                break;
            }
        }
    } else {
        current = [text];
    }
    //console.log(trackListData[`${index}`]);
    currentTracks.set(current);
}
onDestroy(() => {
    clearTimeout(playInterval);
    playInterval = null;
    unloadUnusedAudio(true);
    console.log('----------COMPONENT RELOADED-------------');
});
</script>

<div class="player">
    <div class="justify-self-start w-full">
        <TrackDetails
            song={$song}
            trackListRaw={trackListData}
            currentTracks={$currentTracks}
        />
    </div>

    <div class="px-2 w-full">
        <PlaybackControls
            on:prevSong={skipPrev}
            on:nextSong={skipNext}
            disabled={!$song}
        />
    </div>
    {#if $isPlaying && $settings.frogMode}
        <div
            class="flex pointer-events-none absolute z-400 top-[50%]"
            transition:fade={{ duration: fadeDuration }}
        >
            <img src="Froge.gif" class=" left-1/3" alt="frog dance" />
            <img src="frogmusicnotes.gif" alt="frog dance 2" />
        </div>
    {/if}
    <div class="w-full">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
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
    @apply mt-8 grid h-full w-full gap-6;
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
