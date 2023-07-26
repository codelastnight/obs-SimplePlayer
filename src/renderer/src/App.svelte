<script lang="ts">
import { io } from 'socket.io-client';
import { onMount } from 'svelte';
import { Howl, Howler } from 'howler';
import {
    randomize,
    sortDefault,
    sortByArtist,
    sortByDate,
    sortByTitle
} from './helpers';

import Playlist from './Playlist.svelte';
import TrackDetails from './TrackDetails.svelte';
import PlaybackControls from './PlaybackControls.svelte';
import Settings from './Settings.svelte';

import Fa from 'svelte-fa';

import {
    faXmark,
    faCircleNotch,
    faCircleDot,
    faCircleExclamation,
    faCircleCheck,
    faGear
} from '@fortawesome/free-solid-svg-icons';
import frog1 from './static/Froge.gif';
import frog2 from './static/frogmusicnotes.gif';

const socket = io('http://localhost:9990');
const eAPI = window.electronAPI;

let test = 'loading...';
let state = 'init';

const connection = {
    init: [faCircleNotch, 'loading...', 'bg-slate-800'],

    loading: [faCircleDot, 'loading...', 'bg-slate-600'],
    disconnect: [
        faCircleExclamation,
        'ur disconnected :( restart app?',
        'bg-yellow-600'
    ],
    ready: [faCircleCheck, 'ready 2 play ', 'bg-emerald-600']
};
$: connectionText = connection[state][1];
socket.on('onload', function (msg) {
    test = msg;
    socket.emit('whoiam', 'sender');
});
socket.on('whouare', function (msg) {
    test = msg;
    state = 'ready';
});
socket.on('disconnect', function () {
    test = 'uh oh ur disconnected. restart?';
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
let songList = null;
let songPlaying = false;
let playListVisible = false;
let loading = false;
let theme = 'dark';

let duration = '00:00';
let timer = '00:00';

let player = null;

let offsetWidth;

let shuffle = false;
let mute = false;
let slider = 100;

let obsTitle = 'Currently playing DJ(s): ';

let doanimate = true;
let doAnimRand = true;
let showtrackartist = false;
let showtrack = true;
$: replaceTrack = trackName;
let fontSize = 16;
let width = 20;

onMount(() => {
    async function checkSettings() {
        const settings = await eAPI.dataGet('settings');
        const getpath = await eAPI.dataGet('path');
        //const theme = await eAPI.dataGet('theme')

        if (settings !== undefined && settings.type === 'ok') {
            if (settings.data.shuffle) shuffle = true;
            if (settings.data.volume) slider = settings.data.volume;
        }
        // if (theme!== undefined&& theme.type === 'ok') {
        //     setTheme(theme.data);

        // }
        if (getpath !== undefined && getpath.type === 'ok') {
            if (getpath.data.path !== undefined)
                eAPI.handleScanDir(getpath.data.path.toString());
        }
    }

    checkSettings();
});

function updateOBS() {
    socket.emit('update', {
        track: replaceTrack,
        artist: trackArtist,
        title: obsTitle,
        animate: doanimate,
        showtrack: showtrack,
        showartist: showtrackartist,
        fontSize: fontSize,
        width: width,
        animRand: doAnimRand
    });
}

function resetTrackTitle() {
    replaceTrack = trackName;
}

// function setTheme(data) {
//     var icons = document.body.querySelectorAll('svg');
//     if (data.theme == 'light') {
//         theme = 'light';
//         document.body.style.backgroundColor = '#F5F5F5';
//         document.body.style.color = '#212529';

//         icons.forEach((icon) => {
//             icon.style.color = '#212529';
//         });
//     } else if (data.theme == 'dark') {
//         theme = 'dark';
//         document.body.style.backgroundColor = '#212121';
//         document.body.style.color = 'azure';

//         icons.forEach((icon) => {
//             icon.style.color = 'azure';
//         });
//     } else if (data.theme == 'disco') {
//         theme = 'disco';
//         icons.forEach((icon) => {
//             icon.style.color = 'azure';
//         });
//     }
// }

// function themeChange(data) {
//     setTheme(data);
// }

// eAPI.handleThemeChange((event, arg) => {
//     themeChange(arg);
// })
eAPI.logging((e, data) => {
    console.log(data);
});

// function sortByDate(arr, des = false) {
//     arr.sort((a, b) => {
//         if (!des) return b.date - a.date;
//         return a.date - b.date;
//     });
//     return arr;
// }

// function sortDefault(arr, des = false) {
//     arr.sort((a, b) => {
//         if (!des) return a.index - b.index;
//         return b.index - a.index;
//     });
//     return arr;
// }

eAPI.handleSortChange((event, arg) => {
    if (player) {
        var index = player.playlist[player.index].index;

        if (arg.items[0].checked)
            player.playlist = sortByDate(player.playlist, arg.items[6].checked);
        else if (arg.items[1].checked)
            player.playlist = sortByTitle(
                player.playlist,
                arg.items[6].checked
            );
        else if (arg.items[2].checked)
            player.playlist = sortByArtist(
                player.playlist,
                arg.items[6].checked
            );
        else if (arg.items[3].checked)
            player.playlist = sortDefault(
                player.playlist,
                arg.items[6].checked
            );

        player.index = player.playlist.findIndex((x) => x.index == index);
    }
});
eAPI.handleSaveSetting((event, data) => {
    eAPI.dataSet({
        key: 'settings',
        value: { shuffle: shuffle, mute: mute, volume: slider }
    });
    eAPI.handleClosed();
});

eAPI.handleSelectedFiles((event, arg) => {
    console.log(arg);
    startPlayer(arg);
});
eAPI.handlePlaylistAdd((event, path) => {
    addSongToPlaylist(path);
});
eAPI.handlePlaylistRemove((event, path) => {
    removeSongFromPlaylist(path);
});

async function addSongToPlaylist(path) {
    if (!player) return;

    const { common: metadata } = await eAPI.mmParseFile(path, {
        skipCovers: true
    });
    const stats = eAPI.fsStatSync(path);
    // get title, or filename if no title
    const title = metadata.title
        ? metadata.title
        : path.split(path.sep).slice(-1)[0];
    const artist = metadata.artist ? metadata.artist : '';
    const modDate = stats.mtime;
    const index = player.playlist.length;

    player.playlist.push({
        title: path,
        file: path,
        name: title,
        artist: artist,
        date: modDate,
        howl: null,
        index: index
    });
}

function removeSongFromPlaylist(path) {
    if (!player) return;

    const remIndex = player.playlist.findIndex((x) => x.file == path);
    if (remIndex == -1) return;

    player.playlist.splice(remIndex, 1);
    //reshuffle
    player.randomArray = randomize(
        Array.from({ length: player.playlist.length }, (_, i) => i)
    );
}

async function startPlayer(arg) {
    if (songPlaying) {
        player.pause();
        songPlaying = false;
    }
    songList = arg;
    let songArr = [];

    for (let i = 0; i < songList.files.length; i++) {
        let info = songList.names[i];
        if (songList.names == undefined) {
            info = {
                name: songList.files[i],
                artist: 'none',
                date: 'none'
            };
        }
        songArr.push({
            title: songList.files[i],
            file: songList.files[i],
            name: info.title,
            artist: info.artist,
            date: info.modDate,
            howl: null,
            index: i
        });
    }

    const lastPlayed = await eAPI.dataGet('last-played');
    console.log(lastPlayed);
    if (lastPlayed !== undefined && lastPlayed.type === 'ok') {
        var index = arg.files.indexOf(lastPlayed.data.path);

        if (index != -1) {
            player = new Player(songArr, index);
        } else {
            player = new Player(songArr, 0);
        }

        getTags(player.playlist[player.index].file);
    } else if (lastPlayed !== undefined && lastPlayed.type === 'unsaved') {
        player = new Player(songArr, 0);
        getTags(player.playlist[player.index].file);
    }
}

async function getTags(audioFile) {
    let titles = [];
    const { common: metadata } = await eAPI.mmParseFile(audioFile, {
        skipCovers: false
    });

    const title = metadata.title;
    const artist = metadata.artist;
    const album = metadata.album;

    trackName = title ? title : audioFile.split(eAPI.pathSep()).slice(-1)[0];
    trackArtist = artist ? artist : '';

    trackAlbum = album ? album : '';

    //reset
    resetTrackTitle();
    updateOBS();
    // var img = document.getElementById('picture');

    // if (metadata.picture) {
    //     var picture = metadata.picture[0];
    //     img.style.display = 'block';
    //     img.src = `data:${picture.format};base64,${picture.data.toString(
    //         'base64'
    //     )}`;
    //     // img.addEventListener('load', function () {
    //     //     if (theme == 'disco') {
    //     //         var vibrant = new Vibrant(img, 128, 3);
    //     //         var swatches = vibrant.swatches();
    //     //         if (swatches['DarkMuted'])
    //     //             document.body.style.backgroundColor = swatches[
    //     //                 'DarkMuted'
    //     //             ].getHex();
    //     //         else document.body.style.backgroundColor = '#212121';
    //     //         if (swatches['LightVibrant'])
    //     //             document.body.style.color = swatches[
    //     //                 'LightVibrant'
    //     //             ].getHex();
    //     //         else document.body.style.color = 'azure';
    //     //     }
    //     // });
    // } else {
    //     img.style.display = 'none';
    // }

    return titles;
}

function seekToTime(event) {
    player.seek(event.offsetX / offsetWidth);
}
function playPlaylistSong(index) {
    player.skipTo(index);
}
function nextSong() {
    if (shuffle) {
        songPlaying = player.skip('random-next');
    } else {
        songPlaying = player.skip('noskip-next');
    }
}
function prevSong() {
    if (shuffle) {
        songPlaying = player.skip('random-prev');
    } else {
        songPlaying = player.skip('noskip-prev');
    }
}

function showPlaylist() {
    playListVisible = !playListVisible;
}

function playMusic() {
    if (songPlaying) {
        player.pause();
        songPlaying = false;
    } else {
        player.play();
        songPlaying = true;
    }
}

function toggleShuffle() {
    shuffle = !shuffle;
    eAPI.dataSet({
        key: 'settings',
        value: { shuffle: shuffle, volume: slider }
    });
}

function togglemute() {
    if (mute) {
        mute = false;
        player.volume(slider / 100);
    } else {
        mute = true;
        player.volume(0);
    }
    eAPI.dataSet({ key: 'settings', value: { mute: mute, volume: slider } });
}

// function randomize(array) {
//     for (let i = array.length - 1; i > 0; i--) {
//         let j = Math.floor(Math.random() * (i + 1));

//         [array[i], array[j]] = [array[j], array[i]];
//     }
//     return array;
// }

const Player = function (playlist, index) {
    this.playlist = playlist;
    this.index = index;
    this.randomIndex = index;
    this.randomArray = randomize(
        Array.from({ length: playlist.length }, (_, i) => i)
    );
};

Player.prototype = {
    play: function (index) {
        var self = this;
        var sound;

        index = typeof index === 'number' ? index : self.index;
        var data = self.playlist[index];

        if (data.howl) {
            sound = data.howl;
        } else {
            sound = data.howl = new Howl({
                src: [data.file],
                html5: true,
                onplay: function () {
                    duration = self.formatTime(Math.round(sound.duration()));
                    requestAnimationFrame(self.step.bind(self));
                },
                onend: function () {
                    if (shuffle) {
                        self.skip('random');
                    } else {
                        self.skip('right');
                    }
                }
            });
        }

        eAPI.dataSet({ key: 'last-played', value: { path: data.file } });

        sound.play();
        getTags(data.file);

        self.index = index;
    },

    pause: function () {
        var self = this;

        var sound = self.playlist[self.index].howl;

        sound.pause();
    },

    skip: function (direction) {
        var self = this;

        var index = 0;
        if (direction === 'prev') {
            index = self.index - 1;
            if (index < 0) {
                index = self.playlist.length - 1;
            }
        } else if (direction === 'random-next') {
            self.randomIndex += 1;
            if (self.randomIndex >= self.randomArray.length) {
                self.randomIndex = 0;
            }
            index = self.randomArray[self.randomIndex];
        } else if (direction === 'random-prev') {
            self.randomIndex -= 1;
            if (self.randomIndex < 0) {
                self.randomIndex = self.randomArray.length - 1;
            }
            index = self.randomArray[self.randomIndex];
        } else if (direction === 'noskip-prev') {
            index = self.index - 1;
            if (index < 0) {
                index = 0;
                self.pause();
                return false;
            }
        } else if (direction === 'noskip-next') {
            index = self.index + 1;
            if (index >= self.playlist.length) {
                index = self.playlist.length - 1;
                self.pause();

                return false;
            }
        } else {
            index = self.index + 1;
            if (index >= self.playlist.length) {
                index = 0;
            }
        }

        self.skipTo(this.playlist[index].index);
        return true;
    },

    skipTo: function (index) {
        var self = this;

        if (self.playlist[self.index].howl) {
            self.playlist[self.index].howl.stop();
        }
        var data = self.playlist[index];
        index = this.playlist.findIndex((x) => x.index == index);

        if (!songPlaying) {
            songPlaying = true;
            self.play(index);
        } else self.play(index);
    },

    step: function () {
        var self = this;

        var sound = self.playlist[self.index].howl;

        var seek = sound.seek() || 0;
        timer = self.formatTime(Math.round(seek));
        progress.style.width = ((seek / sound.duration()) * 100 || 0) + '%';

        if (sound.playing()) {
            requestAnimationFrame(self.step.bind(self));
        }
    },
    formatTime: function (secs) {
        var minutes = Math.floor(secs / 60) || 0;
        var seconds = secs - minutes * 60 || 0;

        return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    },
    volume: function (val) {
        Howler.volume(val);
    },
    seek: function (time) {
        var self = this;

        var sound = self.playlist[self.index].howl;

        if (sound.playing() || true) {
            sound.seek(sound.duration() * time);
            requestAnimationFrame(self.step.bind(self));
        }
    }
};

var volumnUp = function () {
    if (slider !== 100) {
        slider = slider + 2;
        player.volume(slider / 100);
    }
};

var volumnDown = function () {
    if (slider !== 0) {
        slider = slider - 2;
        player.volume(slider / 100);
    }
};

var handleKeyboardPress = function (keycode) {
    switch (keycode) {
        case 'MediaPlayPause':
        case ' ':
            playMusic();
            break;
        case 'ArrowRight':
        case 'MediaTrackNext':
            nextSong();
            break;
        case 'ArrowLeft':
        case 'MediaTrackPrevious':
            prevSong();
            break;
        case 'ArrowUp':
            volumnUp();
            break;
        case 'ArrowDown':
            volumnDown();
            break;
        default:
            break;
    }
};

$: if (player) {
    player.volume(slider / 100);
    mute = false;
}
</script>

<style global>
@tailwind base;
@tailwind components;
@tailwind utilities;
body {
    @apply bg-slate-900;
}
.progress .progress-bar {
    -webkit-transition: none;
    -o-transition: none;
    transition: none;
}
.toggle-bg:after {
    content: '';
    @apply absolute top-0.5 left-0.5 bg-slate-400 border border-slate-300 rounded-full h-5 w-5 transition shadow-sm;
}
input:checked + .toggle-bg:after {
    transform: translateX(100%);
    @apply border-slate-500;
}
input:checked + .toggle-bg {
    @apply bg-emerald-400 border-emerald-400;
}
</style>

<svelte:window
    on:keyup={(e) => {
        if (!playListVisible) handleKeyboardPress(e.key);
    }}
/>

<main class="grid grid-cols-2 py-3 px-3 w-full h-full">
    {#if playListVisible}
        <section class="w-[550px] absolute p-4 top-10 right-0 z-50 drop-shadow	">
            <div
                class="bg-slate-700 rounded-xl py-4 px-4 flex flex-col gap-y-2   border border-slate-600"
            >
                <div class="flex justify-between items-center">
                    <h1 class="text-xl font-bold">OBS settings</h1>
                    <div class="flex items-center  gap-x-1 ">
                        <button
                            on:click={updateOBS}
                            class="text-sm py-1 px-4 underline hover:bg-slate-600 rounded-full"
                            >force send obs update</button
                        >
                        <button
                            on:click={() => {
                                playListVisible = false;
                            }}
                            class=" py-2 px-4 bg-slate-800 hover:bg-red-600 rounded-full"
                            ><Fa icon={faXmark} /></button
                        >
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-y-4  ">
                    <label class="flex items-center cursor-pointer relative ">
                        <input
                            bind:checked={doanimate}
                            on:change={updateOBS}
                            class="sr-only"
                            role="switch"
                            type="checkbox"
                        />
                        <div
                            class="toggle-bg bg-slate-600 border-2 border-slate-500 h-6 w-11 rounded-full"
                        />
                        <span class="pl-2">float animation</span>
                    </label>
                    <label class="flex items-center cursor-pointer relative ">
                        <input
                            bind:checked={doAnimRand}
                            on:change={updateOBS}
                            class="sr-only"
                            role="switch"
                            type="checkbox"
                        />
                        <div
                            class="toggle-bg bg-slate-600 border-2 border-slate-500 h-6 w-11 rounded-full"
                        />
                        <span class="pl-2">random animation</span>
                    </label>
                    <label class="flex items-center cursor-pointer relative ">
                        <input
                            bind:checked={showtrackartist}
                            on:change={updateOBS}
                            class="sr-only"
                            role="switch"
                            type="checkbox"
                        />
                        <div
                            class="toggle-bg bg-slate-600 border-2 border-slate-500 h-6 w-11 rounded-full"
                        />
                        <span class="pl-2">show artist</span>
                    </label>
                    <label class="flex items-center cursor-pointer relative ">
                        <input
                            bind:checked={showtrack}
                            on:change={updateOBS}
                            class="sr-only"
                            role="switch"
                            type="checkbox"
                        />
                        <div
                            class="toggle-bg bg-slate-600 border-2 border-slate-500 h-6 w-11 rounded-full"
                        />
                        <span class="pl-2">show track</span>
                    </label>
                </div>
                <label for="titletext">obs heading:</label>
                <input
                    bind:value={obsTitle}
                    on:input={updateOBS}
                    class="bg-slate-600 px-4 py-1 w-full rounded-lg"
                    id="titletext"
                    type="text"
                />
                <label>change track text (resets automatically):</label>
                <div class="flex gap-x-2">
                    <input
                        bind:value={replaceTrack}
                        on:input={updateOBS}
                        class="bg-slate-600 px-4 py-1 w-full rounded-lg"
                        id="titletext"
                        type="text"
                    />
                    <button
                        on:click={() => {
                            resetTrackTitle();
                            updateOBS();
                        }}
                        class="py-1 px-4 bg-slate-800 hover:bg-slate-600 rounded-full"
                        >reset</button
                    >
                </div>

                <label class="flex justify-end gap-x-2">
                    fontsize
                    <input
                        class="bg-slate-600 px-2 py-1 rounded-lg"
                        type="number"
                        on:change={updateOBS}
                        bind:value={fontSize}
                        min="6"
                        max="50"
                    />
                    <input
                        type="range"
                        bind:value={fontSize}
                        on:input={updateOBS}
                        min="6"
                        max="50"
                    />
                    <button
                        on:click={() => {
                            fontSize = 16;
                            updateOBS();
                        }}
                        class="py-1 px-4 bg-slate-800 hover:bg-slate-600  rounded-full"
                        >reset</button
                    >
                </label>
                <label class="flex justify-end gap-x-2 ">
                    box width
                    <input
                        class="bg-slate-600 px-2 py-1 rounded-lg"
                        type="number"
                        on:change={updateOBS}
                        bind:value={width}
                        min="6"
                        max="80"
                    />
                    <input
                        type="range"
                        bind:value={width}
                        on:input={updateOBS}
                        min="6"
                        max="80"
                    />
                    <button
                        on:click={() => {
                            width = 20;
                            updateOBS();
                        }}
                        class="py-1 px-4 bg-slate-800 hover:bg-slate-600 rounded-full"
                        >reset</button
                    >
                </label>
            </div>
        </section>
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
                {player}
                on:changeSong={(event) => playPlaylistSong(event.detail.index)}
            />
        {/if}
    </section>

    <section
        class="flex flex-col h-full w-full pb-6 items-center justify-between"
    >
        <div class="flex gap-x-2 self-end justify-between  w-full">
            <div
                class={`py-2 px-4 rounded-full flex gap-x-2 items-center ${connection[state][2]} w-fit `}
            >
                <Fa icon={connection[state][0]} spin={state === 'init'} />
                <p>{connectionText}</p>
            </div>
            <button
                type="button"
                id="playlistBtn"
                on:focus={(e) => e.target.blur()}
                on:click={showPlaylist}
                class="rounded-full gap-x-2 px-4 py-2 flex items-center hover:bg-slate-700"
            >
                OBS Settings
                <Fa icon={faGear} />
            </button>
        </div>

        <div class="flex flex-col  h-full w-full justify-between my-8">
            <div class=" text-center">
                <TrackDetails {trackName} {trackArtist} {trackAlbum} {theme} />
                {#if songPlaying}
                    <div class="flex pointer-events-none	">
                        <img
                            src={frog1}
                            class="absolute left-1/3"
                            alt="frog dance"
                        />
                        <img src={frog2} alt="frog dance 2" />
                    </div>
                {/if}
            </div>

            <div class="px-2">
                <div class="col-md-12 text-center">
                    <PlaybackControls
                        on:prevSong={prevSong}
                        on:nextSong={nextSong}
                        on:playMusic={playMusic}
                        {songPlaying}
                    />
                </div>

                <div class="col-md-12 text-center">
                    <div id="timer">{timer}</div>
                    <div id="duration">{duration}</div>
                    <br />

                    <div
                        class="progress bg-slate-500 overflow-hidden rounded-full"
                        id="seek"
                        bind:clientWidth={offsetWidth}
                        on:click={(e) => seekToTime(e)}
                    >
                        <div
                            class="progress-bar bg-danger bg-emerald-300 h-full rounded-full"
                            role="progressbar"
                            id="progress"
                            aria-valuemin="0"
                            aria-valuemax="100"
                        />
                    </div>
                </div>
            </div>
        </div>

        <div class="flex items-center justify-between w-full" id="outerCtrl">
            <Settings
                on:showPlaylist={showPlaylist}
                on:toggleShuffle={toggleShuffle}
                {shuffle}
                on:togglemute={togglemute}
                bind:slider
                {mute}
            />
        </div>
    </section>
</main>
