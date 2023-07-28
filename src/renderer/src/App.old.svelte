<script lang="ts">
/// EXISTS FOR REFERENCE ONLY
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
import TrackDetails from './components/TrackDetails.svelte';
import PlaybackControls from './PlaybackControls.svelte';
import Settings from './Settings.svelte';

import Fa from 'svelte-fa';

import {
    faCircleNotch,
    faCircleDot,
    faCircleExclamation,
    faCircleCheck,
    faGear
} from '@fortawesome/free-solid-svg-icons';
import frog1 from './static/Froge.gif?asset';
import frog2 from './static/frogmusicnotes.gif?asset';
import ObsSettings from './OBSSettings.svelte';

const socket = io('http://localhost:9990', {});
const eAPI = window.api;

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
let obsVisible = false;
let loading = false;
let theme = 'dark';

let duration = '00:00';
let timer = '00:00';

let player = null;

let offsetWidth;

let shuffle = false;
let mute = false;
let slider = 100;

let obsSettingData;
$: obsSettingData, updateOBS();
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
    console.log(obsSettingData);
    socket.emit('update', {
        ...obsSettingData,
        artist: trackArtist
    });
}

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

    const { title, artist, modDate } = await eAPI.parseMetadata(path);
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
    const { title, artist, album } = await eAPI.parseMetadata(audioFile);

    trackName = title;
    trackArtist = artist;

    trackAlbum = album;
    updateOBS();

    return titles;
}

function seekToTime(event) {
    player.seek(event.offsetX / offsetWidth);
}
function playPlaylistSong(index) {
    player.skipTo(index);
    songPlaying = true;
}
function nextSong() {
    songPlaying = player.skip('noskip-next');
}
function prevSong() {
    songPlaying = player.skip('noskip-prev');
}

function showPlaylist() {
    obsVisible = !obsVisible;
}

function playMusic() {
    if (songPlaying) {
        player.pause();
        songPlaying = false;
    } else {
        player.play();
        getTags(player.getCurrentFile());
        eAPI.dataSet({
            key: 'last-played',
            value: { path: player.getCurrentFile() }
        });

        songPlaying = true;
    }
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
                    self.skip('right');
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

<svelte:window
    on:keyup={(e) => {
        if (!obsVisible) handleKeyboardPress(e.key);
    }}
/>

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
                {player}
                on:changeSong={(event) => playPlaylistSong(event.detail.index)}
            />
        {/if}
    </section>

    <section
        class="flex flex-col h-full w-full pb-6 items-center justify-between"
    >
        <div class="flex gap-x-2 self-end justify-between w-full">
            <div
                class={`py-2 px-4 rounded-full flex gap-x-2 items-center ${connection[state][2]} w-fit `}
            >
                <Fa icon={connection[state][0]} spin={state === 'init'} />
                <p>{connectionText}</p>
            </div>
            <button
                type="button"
                on:focus={(e) => e.target.blur()}
                on:click={showPlaylist}
                class="rounded-full gap-x-2 px-4 py-2 flex items-center hover:bg-slate-700"
            >
                OBS Settings
                <Fa icon={faGear} />
            </button>
        </div>

        <div class="flex flex-col h-full w-full justify-between my-8">
            <div class=" text-center">
                <TrackDetails {trackName} {trackArtist} {trackAlbum} {theme} />
                {#if songPlaying}
                    <div class="flex pointer-events-none">
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

                <div class="col-md-12">
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
                on:togglemute={togglemute}
                bind:slider
                {mute}
            />
        </div>
    </section>
</main>

<style global lang="postcss">
@tailwind base;
@tailwind components;
@tailwind utilities;
body {
    @apply h-full bg-slate-900 text-white;
}
html {
    @apply h-full;
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
