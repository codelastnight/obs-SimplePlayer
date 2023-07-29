<script>
import { createEventDispatcher } from 'svelte';
export let isPlaying;

import Fa from 'svelte-fa';
import {
    faStepBackward,
    faStepForward
} from '@fortawesome/free-solid-svg-icons';
const dispatch = createEventDispatcher();

function prevSong() {
    dispatch('prevSong');
}

function nextSong() {
    dispatch('nextSong');
}
</script>

<div class="flex items-center gap-x-4 justify-center" role="group">
    <button
        type="button"
        id="prevBtn"
        class="px-6 py-4 hover:bg-slate-700 rounded-full"
        on:focus={(e) => e.target.blur()}
        on:click={prevSong}
    >
        <Fa size="2x" icon={faStepBackward} />
    </button>

    <button
        type="button"
        id="playBtn"
        class="btn btn-primary-outline btn-lg hover:scale-110 active:scale-95"
        on:focus={(e) => e.target.blur()}
        on:click={() => (isPlaying = !isPlaying)}
    >
        {#if !isPlaying}
            <img src="play.png" alt="play song" class="w-[8rem]" />
        {:else}
            <img src="pause.png" alt="pause song" class="w-[8rem]" />
        {/if}
    </button>

    <button
        type="button"
        id="nextBtn"
        class="px-6 py-4 hover:bg-slate-700 rounded-full"
        on:focus={(e) => e.target.blur()}
        on:click={nextSong}
    >
        <Fa size="2x" icon={faStepForward} />
    </button>
</div>
