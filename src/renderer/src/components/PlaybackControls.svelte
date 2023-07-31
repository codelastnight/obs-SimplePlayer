<script>
import { createEventDispatcher } from 'svelte';
import { handleConfirm } from './ModalConcert.svelte';
import { isPlaying } from './../store';
import Fa from 'svelte-fa';
import {
    faStepBackward,
    faStepForward
} from '@fortawesome/free-solid-svg-icons';

export let disabled = false;
const dispatch = createEventDispatcher();

function prevSong() {
    handleConfirm('skip to previous', () => {
        dispatch('prevSong');
    });
}

function nextSong() {
    handleConfirm('skip song', () => {
        dispatch('nextSong');
    });
}
function playPause() {
    const action = $isPlaying ? 'pause' : 'play';
    handleConfirm(action, () => {
        isPlaying.set(!$isPlaying);
    });
}
</script>

<div
    class="flex items-center gap-x-4 justify-center"
    class:disabled
    role="group"
>
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
        on:click={playPause}
    >
        {#if !$isPlaying}
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

<style>
.disabled {
    pointer-events: none;
    opacity: 0.5;
}
</style>
