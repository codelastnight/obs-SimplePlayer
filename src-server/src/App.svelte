<script lang="ts">
import Froggie from './lib/Froggie.svelte';
import { fly } from 'svelte/transition';

import Lily from './lib/Lily.svelte';
import { io } from 'socket.io-client';
import Textbox from './lib/Textbox.svelte';
import type { OBSData } from '../../src/renderer/src/components/OBSSettings.svelte';
import { onMount } from 'svelte';
import Marquee from 'svelte-fast-marquee';

const socket = io();
const delay = 2000; //120000

const demoData: OBSData[] = [
    {
        title: 'test1',
        track: ['track name 1 long long track names', 'track 2'],
        frogspeak: 'did you know. john wick',
        flavortext: [],
        isPlaying: true
    },
    {
        title: 'test2',
        track: ['track name 1ss'],
        frogspeak: '',
        flavortext: [],
        isPlaying: false
    }
];
let title = '';
let tracklisting = [];
let flavortext = [];
let frogspeak = '';
let isPlaying = false;
socket.on('onload', function (msg) {
    socket.emit('whoiam', 'reciever');
});
socket.on('whouare', function (msg) {
    socket.emit('ask4update', 'pls');
});
socket.on('update', function (msg: OBSData) {
    console.log(msg);

    title = msg.title;
    tracklisting = msg.track;
    flavortext = msg.flavortext;
    isPlaying = msg.isPlaying;
    frogspeak = msg.frogspeak;
    lilyState = 'talk';
});
socket.on('disconnect', function () {
    title = 'disconnected';
    tracklisting = ['try refreshing browser source or app?'];
    isPlaying = false;
});
function demo(num) {
    title = demoData[num].title;
    tracklisting = demoData[num].track;
    flavortext = demoData[num].flavortext;
    isPlaying = demoData[num].isPlaying;
    frogspeak = demoData[num].frogspeak;
    lilyState = 'talk';
}
let lilyState;
$: lilyState = isPlaying ? 'listen' : 'idle';
</script>

{#if import.meta.env.MODE === 'development'}
    <button on:click={() => demo(0)}>demo button</button>
    <button on:click={() => demo(1)}>demo button</button>
{/if}
<main>
    <div class="flex items-center">
        <Lily
            bind:state={lilyState}
            defaultState={isPlaying ? 'listen' : 'idle'}
        />
        {#if title || tracklisting.length > 0}
            <div transition:fly={{ y: -20 }}>
                <Textbox classes="lilybox">
                    {#key title}
                        <Marquee direction="left" speed={20}>
                            <p class="title padding" in:fly={{ y: -20 }}>
                                <b>{title}</b>
                            </p>
                            {#each flavortext as text, index (index)}
                                <p class="title padding">{text}</p>
                            {/each}
                        </Marquee>
                    {/key}
                    {#each tracklisting as text, index (text)}
                        {#if index === 0}
                            <p
                                class="italic"
                                in:fly|global={{ y: -20, delay: 100 }}
                            >
                                {text}
                            </p>
                        {:else}
                            <p
                                class="italic"
                                in:fly|global={{ y: -20, delay: 200 * index }}
                            >
                                + {text}
                            </p>
                        {/if}
                    {/each}
                </Textbox>
            </div>
        {/if}
    </div>
    <div>
        {#if !!frogspeak}
            <Textbox position="bottom">
                <p>{frogspeak}</p>
            </Textbox>
        {/if}
        <Froggie />
    </div>
</main>

<style>
.padding {
    padding-left: 3rem;
    padding-bottom: 0.5rem;
    padding-right: 3rem;
}
p {
    all: unset;
    display: block;
    color: blue;
    font-size: 0.8rem;
}
.italic {
    font-style: italic;
}
.title {
    font-size: 1.2rem;
}
main {
    position: fixed;
    bottom: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    align-items: flex-end;
    padding-right: 3rem;
}
.flex {
    display: flex;
}
.items-center {
    justify-items: center;
}
:global(.lilybox) {
    margin-top: 3rem;
    min-width: 15rem;
}
</style>
