<script context="module" lang="ts">
export interface OBSData {
    title: string;
    track: string[];
    frogspeak: string;
    flavortext: string[];
    isPlaying: boolean;
    announcements: string[];
}
</script>

<script lang="ts">
import { faXmark, faGear } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';
import { createEventDispatcher, onMount } from 'svelte';
import { ClientSong } from '../Player.svelte';
import { currentTracks, activePlaylist, isPlaying, ribbitText } from '../store';
import Switch from './Switch.svelte';

export let song: ClientSong;

let obsVisible = false;

const dispatch = createEventDispatcher();

let obsTitle = 'DJ: ';

$: replaceTrack = song?.title || '';
let frogspeak = '';
$: song, $currentTracks, $isPlaying, updateOBS();
let flavortextinput = 'JEWELS OF THE FOREST, "MUSIC" TO MY EARS';
let flavortext = flavortextinput.split(',');
let announcementInput =
    'ATTENTION FROGGERS:\n IMPORTANT ANNOUNCEMENT \n have a nice day :)';
let announcements = [];
let showAnnouncements = false;
function updateOBS() {
    const isTrack = $activePlaylist.type === 'track';

    if (!song) return;
    const combine = `${song.title} by ${song.artist || 'unkown'}`;
    let track = isTrack ? $currentTracks : [combine];
    let title = isTrack ? obsTitle + song.title : 'Currently Playing:';
    const data: OBSData = {
        track: showText ? track : [],
        title: showText ? title : '',
        frogspeak: frogspeak,
        flavortext: flavortext,
        isPlaying: $isPlaying,
        announcements: showAnnouncements ? announcements : []
    };
    dispatch('update', data);
}

function setflavortext() {
    flavortext = flavortextinput.split(',') || [];
    updateOBS();
}
function setAnnouncements() {
    announcements = announcementInput.split('\n');
    updateOBS();
}
let showText = true;
function hideText() {}
let didMount = false;
let froggietiming = 180;
onMount(() => {
    const data: OBSData = {
        track: showText ? [replaceTrack] : [],
        title: showText ? obsTitle : '',
        frogspeak: frogspeak,
        flavortext: flavortext,
        isPlaying: $isPlaying,
        announcements: showAnnouncements ? announcements : []
    };
    setAnnouncements();
    setflavortext();
    dispatch('update', data);
    runClock();

    return () => {
        clearTimeout(clocktimeout);
    };
});

function close() {
    obsVisible = false;
}
let ribbitIndex = 0;
let clocktimeout;
function runClock() {
    const now = new Date();
    const timeToNextTick =
        (froggietiming - now.getSeconds()) * 1000 - now.getMilliseconds();
    console.log(timeToNextTick);
    clocktimeout = setTimeout(function () {
        const index = (ribbitIndex + 1) % $ribbitText.length;
        frogspeak = $ribbitText[index];
        ribbitIndex = index;
        updateOBS();
        runClock();
    }, timeToNextTick);
}

// display the initial clock

// start the running clock display that will update right on the minute change
</script>

<button
    type="button"
    on:click={() => (obsVisible = !obsVisible)}
    class="rounded-full gap-x-2 px-4 py-2 flex items-center hover:bg-slate-700"
>
    OBS
    <Fa icon={faGear} />
</button>
{#if obsVisible}
    <section class="w-[550px] absolute p-4 top-10 right-0 z-50 drop-shadow">
        <div
            class="bg-neutral-900 rounded-xl py-4 px-4 flex flex-col gap-y-0.5 border border-slate-800"
        >
            <header class="flex justify-between items-center">
                <h1 class="text-xl font-bold">OBS settings</h1>
                <div class="flex items-center">
                    <a
                        href="http://localhost:9990"
                        target="_blank"
                        class="text-sm py-1 px-3 hover:bg-slate-600 rounded-full underline"
                    >
                        open in browser
                    </a>
                    <!-- <button class='text-sm py-1 pr-4 pl-1  underline hover:bg-slate-600 rounded-r-full underline' on:click={()=> navigator.clipboard.writeText('http://localhost:9990')}> 
                        <Fa icon={faCopy} />
                    </button> -->
                    <button
                        on:click={close}
                        class=" py-2 px-4 ml-2 bg-slate-800 hover:bg-red-600 rounded-full"
                        ><Fa icon={faXmark} /></button
                    >
                </div>
            </header>

            <div class="flex items-center gap-1">
                <Switch bind:checked={showText} on:change={updateOBS}>
                    show text
                </Switch>
            </div>
            <label>time between froggie fact (min 60 seconds)</label>
            <input
                bind:value={froggietiming}
                on:change={updateOBS}
                class="input"
                id="titletext"
                min={60}
                type="number"
            />
            <div class="grid grid-cols-2 gap-y-4"></div>
            <label for="titletext">obs heading:</label>
            <input
                bind:value={obsTitle}
                on:input={updateOBS}
                class="input"
                id="titletext"
                type="text"
            />
            <label for="flavor">
                flavor text (separate by commas) (resets on app restart):
            </label>
            <div class="flex gap-1">
                <input
                    bind:value={flavortextinput}
                    on:input={updateOBS}
                    class="input"
                    id="flavor"
                    type="text"
                />
                <button class="text-sm" on:click={setflavortext}>
                    update text
                </button>
            </div>
            <div>
                <Switch bind:checked={showAnnouncements} on:change={updateOBS}>
                    show annoucements (split by enter)
                </Switch>
            </div>
            <textarea
                class="input h-[4rem] text-sm"
                bind:value={announcementInput}
            ></textarea>
            <button class="text-sm" on:click={setAnnouncements}>
                update Announcmeent text
            </button>
        </div>
    </section>
{/if}

<style lang="postcss">
.input {
    @apply w-full rounded-lg bg-slate-600 px-4 py-1;
}
label {
    @apply mt-2 text-sm;
}
button {
    @apply flex justify-center rounded-full bg-gray-500/25 px-3 py-1;
}
button:hover {
    @apply bg-slate-700;
}
button:active {
    @apply bg-slate-600;
}
</style>
