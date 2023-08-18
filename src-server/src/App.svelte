<script lang="ts">
import Froggie from './lib/Froggie.svelte';
import { fly, scale } from 'svelte/transition';

import Lily from './lib/Lily.svelte';
import { io } from 'socket.io-client';
import Textbox from './lib/Textbox.svelte';
import type { OBSData } from '../../src/renderer/src/components/OBSSettings.svelte';
import { onMount } from 'svelte';
import Marquee from 'svelte-fast-marquee';
import Announcement from './lib/Announcement.svelte';

const socket = io();
const delay = 2000; //120000

const demoData: OBSData[] = [
    {
        title: 'test1',
        track: ['track name 1 long long track names'],
        frogspeak: 'did you know. john wick',
        flavortext: [],
        isPlaying: true,
        announcements: ['raffle goin on rn', 'check in on this raffle']
    },
    {
        title: 'test2',
        track: [
            'track name 1 long long track nafsjdhfa jdhaj dhfajha hasdjfhsjkh fjksd fhsjkdhmes',
            'track name 1ss'
        ],
        frogspeak: '',
        flavortext: [],
        isPlaying: false,
        announcements: []
    }
];
let title = '';
let tracklisting = [];
let flavortext = [];
let frogspeak = '';
let isPlaying = false;
let announcements = [];
onMount(() => {
    socket.on('onload', function (msg) {
        socket.emit('whoiam', 'reciever');
    });
    socket.on('whouare', function (msg) {
        socket.emit('ask4update', 'pls');
    });
    socket.on('update', function (msg: OBSData) {
        title = msg.title;
        tracklisting = msg.track;
        flavortext = msg.flavortext;
        isPlaying = msg.isPlaying;
        frogspeak = msg.frogspeak;
        lilyState = 'talk';
        announcements = msg.announcements;
    });
    socket.on('disconnect', function () {
        title = 'disconnected';
        tracklisting = ['try refreshing browser source or app?'];
        isPlaying = false;
    });
});

function demo(num) {
    title = demoData[num].title;
    tracklisting = demoData[num].track;
    flavortext = demoData[num].flavortext;
    isPlaying = demoData[num].isPlaying;
    frogspeak = demoData[num].frogspeak;
    announcements = demoData[num].announcements;
    lilyState = 'talk';
}
let lilyState;
let froggieState;
$: lilyState = isPlaying ? 'listen' : 'idle';
</script>

<div style="position: absolute; top: 0; left: 0; right: 0;">
    <Announcement {announcements} />
</div>
{#if import.meta.env.MODE === 'development'}
    <button style="margin-top: 3rem;" on:click={() => demo(0)}
        >demo button</button
    >
    <button style="margin-top: 3rem;" on:click={() => demo(1)}
        >demo button</button
    >
{/if}
<div class="topright">
    <img class="logo" src="/logo.png" alt="frogfest logo" />
</div>
<main>
    <div class="flex items-center">
        <Lily
            bind:state={lilyState}
            defaultState={isPlaying ? 'listen' : 'idle'}
        />
        <div style="margin-top: 5rem" class="bob">
            {#if title}
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
                </Textbox>
            {/if}
            {#each tracklisting as text, index (text)}
                <Textbox classes="" delay={200 * index}>
                    {#if index === 0}
                        <p class="italic">
                            {text}
                        </p>
                    {:else}
                        <p class="italic">
                            + {text}
                        </p>
                    {/if}
                </Textbox>
            {/each}
        </div>
    </div>
    <div>
        <Froggie bind:state={froggieState} {frogspeak} />
    </div>
</main>

<style>
.bob {
    animation-name: bob;
    animation-duration: 0.5s;
    animation-direction: alternate;
    animation-timing-function: steps(2, jump-none);
    animation-iteration-count: infinite;
}
@keyframes bob {
    from {
        transform: translateY(-3px);
    }
    to {
        transform: translateY(0px);
    }
}
.topright {
    position: absolute;
    top: 0;
    right: 0;
    padding-right: 2rem;
    padding-top: 3rem;
}
.logo {
    animation-name: logo;
    transform-style: preserve-3d;

    width: 8rem;
    animation-duration: 8s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
}
@keyframes logo {
    0% {
        transform: rotateY(0deg);
    }

    100% {
        transform: rotateY(360deg);
    }
}
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
    min-width: 15rem;
}
</style>
