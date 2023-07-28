<script>
import { createEventDispatcher } from 'svelte';
import Fa from 'svelte-fa';
import { faVolumeMute, faVolumeHigh } from '@fortawesome/free-solid-svg-icons';
import {concertMode} from './store';

export let slider;
export let mute;

let concert = false;
$: concertMode.set(concert)
const dispatch = createEventDispatcher();

function togglemute() {
    dispatch('togglemute');
}
</script>

<div class=" flex gap-x-1 items-center">
    <button
        type="button"
        id="checkboxrn"
        on:click={togglemute}
        class="btn btn-primary-outline btn-lg justify-content-end hover:bg-slate-700 py-2 px-4 rounded-full"
    >
        {#if mute}
            <Fa icon={faVolumeMute} class="w-[25px]" />
        {:else}
            <Fa icon={faVolumeHigh} class="w-[25px]" />
        {/if}
    </button>

    <input
        type="range"
        min="0"
        max="100"
        class="slider"
        bind:value={slider}
        id="myRange"
    />
</div>

<label class="flex items-center cursor-pointer relative rounded-full  py-1 pl-3 pr-1 mr-1" class:concert={concert}>
    <span class="pr-2 text-sm">Concert Mode</span>

    <input
        bind:checked={concert}
        class="sr-only"
        role="switch"
        type="checkbox"
    />
    <div
        class="toggle-bg relative bg-slate-600 border border-slate-500 h-6 w-11 rounded-full"
    />
</label>

<style lang="postcss">
    input:checked + .toggle-bg:after {
        transform: translateX(100%);
        @apply border-gray-200 bg-gray-200;
    }
    input:checked + .toggle-bg {
        @apply bg-emerald-700 border-green-300/25;
    }
    .toggle-bg:after {
        content: '';
        @apply absolute top-[1px] left-[1px] bg-gray-400 border  border-gray-400 rounded-full h-5 w-5 transition shadow-sm;
    }
    
    .concert {
        @apply bg-purple-900;
    }
    </style>