<script>
import { createEventDispatcher } from 'svelte';

export let slider;
export let mute;
export let shuffle;

const dispatch = createEventDispatcher();

function showPlaylist() {
    dispatch('showPlaylist');
}

function toggleShuffle() {
    dispatch('toggleShuffle');
}

function togglemute() {
    dispatch('togglemute');
}
</script>

<div class="slidecontainer flex gap-x-3 items-center">
    {#if mute}
    <button
        type="button"
        id="checkboxrn"
        on:focus={(e) => e.target.blur()}
        on:click={togglemute}
        class="btn btn-primary-outline btn-lg justify-content-end">
        <i class="fas fa-volume-off fa-lg fa-inverse" />
    </button>
{:else}
    <button
        type="button"
        id="checkboxrn"
        on:focus={(e) => e.target.blur()}
        on:click={togglemute}
        class="btn btn-primary-outline btn-lg justify-content-end">
        <i class="fas fa-volume-up fa-lg fa-inverse" />
    </button>
{/if}
    <input
    type="range"
    min="0"
    max="100"
    class="slider"
    bind:value={slider}
    id="myRange" />
  
</div>

<div class="btn-group float-right flex gap-x-4 " role="group">
   

    {#if shuffle}
        <button
            type="button"
            id="shuffleBtn"
            on:focus={(e) => e.target.blur()}
            on:click={toggleShuffle}
            class="btn btn-primary-outline btn-lg">
            <i class="fas fa-random fa-lg fa-inverse" />
        </button>
    {:else}
        <button
            type="button"
            id="shuffleBtn"
            on:focus={(e) => e.target.blur()}
            on:click={toggleShuffle}
            class="btn btn-primary-outline btn-lg justify-content-end">
            <i class="fas fa-sync-alt fa-lg fa-inverse" />
        </button>
    {/if}

    <button
        type="button"
        id="playlistBtn"
        on:focus={(e) => e.target.blur()}
        on:click={showPlaylist}
        class="btn btn-primary-outline btn-lg justify-content-end">
        <i class="fas fa-bars fa-lg fa-inverse" />
    </button>
</div>
