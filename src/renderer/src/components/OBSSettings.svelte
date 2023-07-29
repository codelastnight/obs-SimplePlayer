<script lang="ts">
import { faXmark, faGear } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';
import { createEventDispatcher, onMount } from 'svelte';
import { ClientSong } from '../Player.svelte';
export let song: ClientSong;

let obsVisible = false;

const dispatch = createEventDispatcher();

let obsTitle = 'Currently playing DJ(s): ';
let doanimate = true;
let doAnimRand = true;
let showtrackartist = false;
let showtrack = true;
let replaceTrack;
$: replaceTrack = song?.title || '';
let fontSize = 16;
let width = 20;
$: song, updateOBS();
function resetTrackTitle() {
    replaceTrack = song.title;
}
function updateOBS() {
    if (!song) return;
    const data = {
        track: replaceTrack,
        title: obsTitle,
        animate: doanimate,
        showtrack: showtrack,
        showartist: showtrackartist,
        fontSize: fontSize,
        width: width,
        animRand: doAnimRand
    };
    dispatch('update', data);
}

onMount(() => {
    const data = {
        track: replaceTrack,
        title: obsTitle,
        animate: doanimate,
        showtrack: showtrack,
        showartist: showtrackartist,
        fontSize: fontSize,
        width: width,
        animRand: doAnimRand
    };
    console.log(data);

    dispatch('update', data);
});

function close() {
    obsVisible = false;
}
</script>

<button
    type="button"
    on:click={() => (obsVisible = !obsVisible)}
    class="rounded-full gap-x-2 px-4 py-2 flex items-center hover:bg-slate-700"
>
    OBS Settings
    <Fa icon={faGear} />
</button>
{#if obsVisible}
    <section class="w-[550px] absolute p-4 top-10 right-0 z-50 drop-shadow">
        <div
            class="bg-neutral-900 rounded-xl py-4 px-4 flex flex-col gap-y-2 border border-slate-800"
        >
            <header class="flex justify-between items-center">
                <h1 class="text-xl font-bold">OBS settings</h1>
                <div class="flex items-center">
                    <a
                        href="http://localhost:9990"
                        target="_blank"
                        class="text-sm py-1 px-3 underline hover:bg-slate-600 rounded-full underline"
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
            <div class="flex items-center gap-1"></div>
            <div class="grid grid-cols-2 gap-y-4">
                <label class="flex items-center cursor-pointer relative">
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
                <label class="flex items-center cursor-pointer relative">
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
                <label class="flex items-center cursor-pointer relative">
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
                <label class="flex items-center cursor-pointer relative">
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
                    class="py-1 px-4 bg-slate-800 hover:bg-slate-600 rounded-full"
                >
                    reset
                </button>
            </label>
            <label class="flex justify-end gap-x-2">
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

<style lang="postcss">
input:checked + .toggle-bg:after {
    transform: translateX(100%);
    @apply border-slate-500;
}
input:checked + .toggle-bg {
    @apply border-emerald-400 bg-emerald-400;
}
.toggle-bg:after {
    content: '';
    @apply absolute left-0.5 top-0.5 h-5 w-5 rounded-full border border-slate-300 bg-slate-400 shadow-sm transition;
}
</style>
