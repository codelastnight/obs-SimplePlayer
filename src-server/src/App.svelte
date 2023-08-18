<script lang="ts">
import Froggie from './lib/Froggie.svelte';
import { fly } from 'svelte/transition';

import Lily from './lib/Lily.svelte';
import { io } from 'socket.io-client';
import Textbox from './lib/Textbox.svelte';
import type { OBSData } from '../../src/renderer/src/components/OBSSettings.svelte';
import { onMount } from 'svelte';
const socket = io();
const delay = 2000; //120000

let lilyState;
const demoData: OBSData[] = [
    {
        title: 'test1',
        track: ['track name 1 long long track names', 'track 2'],
        frogspeak: 'did you know. john wick'
    },
    {
        title: 'test2',
        track: ['track name 1', 'track 2', 'track3'],
        frogspeak: 'did you know. john wick'
    }
];
let title = '';
let tracklisting = [];

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
    lilyState = 'listen';
});
socket.on('disconnect', function () {
    title = 'disconnected';
    tracklisting = ['try refreshing browser source or app?'];
});
function demo(num) {
    title = demoData[num].title;
    tracklisting = demoData[num].track;
    lilyState = 'talk';
}
</script>

<button on:click={() => demo(0)}>demo button</button>
<button on:click={() => demo(1)}>demo button</button>

<main>
    <div class="flex">
        <Lily bind:state={lilyState} />
        {#if title || tracklisting.length > 0}
            <div>
                <Textbox classes="lilybox">
                    {#key title}
                        <p class="title" in:fly={{ y: -20 }}><b>{title}</b></p>
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
        <Textbox position="bottom">
            <p>yumsicle</p>
        </Textbox>
        <Froggie />
    </div>
</main>

<style>
p {
    all: unset;
    display: block;
    color: blue;
}
.italic {
    font-style: italic;
}
.title {
    font-size: 1.5rem;
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
:global(.lilybox) {
    margin-top: 3rem;
    min-width: 15rem;
}
</style>
