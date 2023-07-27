<script>
import { createEventDispatcher } from 'svelte';
import Fa from 'svelte-fa';
import { faVolumeMute, faVolumeHigh } from '@fortawesome/free-solid-svg-icons';
export let slider;
export let mute;

const dispatch = createEventDispatcher();

function togglemute() {
    dispatch('togglemute');
}
</script>

<div class="slidecontainer flex gap-x-1 items-center">
    <button
        type="button"
        id="checkboxrn"
        on:focus={(e) => e.target.blur()}
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

<div class=" flex gap-x-4" role="group" />
