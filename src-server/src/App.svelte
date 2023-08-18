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

let lilyState;
const demoData: OBSData[] = [
    {
        title: 'test1',
        track: ['track name 1 long long track names', 'track 2'],
        frogspeak: 'did you know. john wick',
        flavortext: []
    },
    {
        title: 'test2',
        track: ['track name 1', 'track 2', 'track3'],
        frogspeak: 'did you know. john wick',
        flavortext: []
    }
];
let title = '';
let tracklisting = [];
let flavortext = [];
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
    lilyState = 'talk';
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

<!-- 
<button on:click={() => demo(0)}>demo button</button>
<button on:click={() => demo(1)}>demo button</button> -->

<main>
    <div class="flex">
        <Lily bind:state={lilyState} />
        {#if title || tracklisting.length > 0}
            <div>
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
        <Textbox position="bottom">
            <p>yumsicle</p>
        </Textbox>
        <Froggie />
    </div>
</main>

<style>
.padding {
    padding-left: 3rem;
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
:global(.lilybox) {
    margin-top: 3rem;
    min-width: 15rem;
}
</style>
