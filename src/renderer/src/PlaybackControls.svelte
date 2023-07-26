<script>
import { createEventDispatcher } from 'svelte';
export let songPlaying;
import frogPlay from './static/play.png?asset';
import frogPause from './static/pause.png?asset';
import Fa from 'svelte-fa';
import {
    faStepBackward,
    faStepForward
} from '@fortawesome/free-solid-svg-icons';
const dispatch = createEventDispatcher();

function prevSong() {
    dispatch('prevSong');
}

function playMusic() {
    dispatch('playMusic');
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
    {#if !songPlaying}
        <button
            type="button"
            id="playBtn"
            class="btn btn-primary-outline btn-lg hover:scale-110 active:scale-95"
            on:focus={(e) => e.target.blur()}
            on:click={playMusic}
        >
            <img src={frogPlay} alt="play song" class="w-[8rem]" />
        </button>
    {:else}
        <button
            type="button"
            id="pauseBtn"
            class="btn btn-primary-outline btn-lg hover:scale-110 active:scale-95"
            on:focus={(e) => e.target.blur()}
            on:click={playMusic}
        >
            <img src={frogPause} alt="pause song" class="w-[8rem]" />
        </button>
    {/if}
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
