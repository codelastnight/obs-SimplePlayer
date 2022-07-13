<script>
import { createEventDispatcher } from 'svelte';
export let songPlaying;
import frogPlay from './static/play.png'
import frogPause from './static/pause.png'

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
        class="btn btn-primary-outline btn-lg"
        on:focus={(e) => e.target.blur()}
        on:click={prevSong}>
        <i class="fas fa-step-backward fa-2x fa-inverse" />
    </button>
    {#if !songPlaying}
        <button
            type="button"
            id="playBtn"
            class="btn btn-primary-outline btn-lg"
            on:focus={(e) => e.target.blur()}
            on:click={playMusic}>
            <img src={frogPlay} alt='play song' class="w-[8rem]" />
        </button>
    {:else}
        <button
            type="button"
            id="pauseBtn"
            class="btn btn-primary-outline btn-lg"
            on:focus={(e) => e.target.blur()}
            on:click={playMusic}>
            <img src={frogPause} alt='pause song' class="w-[8rem]" />
        </button>
    {/if}
    <button
        type="button"
        id="nextBtn"
        class="btn btn-primary-outline btn-lg"
        on:focus={(e) => e.target.blur()}
        on:click={nextSong}>
        <i class="fas fa-step-forward fa-2x fa-inverse" />
    </button>
</div>
