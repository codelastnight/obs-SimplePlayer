<script>
export let songName;

import Fa from 'svelte-fa';
import { faClose, faMinus } from '@fortawesome/free-solid-svg-icons';
import Marquee from 'svelte-fast-marquee';
import { onMount } from 'svelte';
import ObsStatusChip from './components/ObsStatusChip.svelte';
import { concertMode, isPlaying } from './store';
import About from './components/About.svelte';
import Options from './components/Settings.svelte';

let version;
let isOpen = false;

let optionIsOpen = false;
onMount(() => {
    async function getAboutData() {
        const aboutData = await window.api.getAboutData();
        version = aboutData?.version || '';
    }
    getAboutData();
});
</script>

<header>
    <div class="flex-1 text-xs gap-0.5 flex items-center">
        <button
            type="button"
            class="hover:bg-gray-700"
            on:click={() => (isOpen = true)}
        >
            <p>about</p>
        </button>
        <button
            type="button"
            class="hover:bg-gray-700"
            on:click={() => (optionIsOpen = true)}
        >
            <p>options</p>
        </button>
        <p class="text-white/75 px-3">v{version}</p>
    </div>

    <div
        class="overflow-hidden py-1 text-white transition-all w-[11rem] text-sm text-center"
        class:badge={$isPlaying || $concertMode}
        class:badge-playing={$isPlaying}
        class:concert={$concertMode}
    >
        {#if $isPlaying}
            <Marquee
                direction="left"
                play={$isPlaying}
                speed={$concertMode && $isPlaying ? 20 : 25}
            >
                <p class="mx-3 text-clip">
                    <span class="text-white/75"> now playing: </span>
                    {songName || 'no song'}
                </p>
                {#if $concertMode}
                    <p class="mx-3 text-clip">
                        [Concert Mode
                        <span class="text-white/75"> enabled </span>]
                    </p>
                {/if}
            </Marquee>
        {:else if $concertMode}
            <p class="px-6 w-full truncate text-clip">
                Concert Mode <span class="text-white/75"> enabled</span>
            </p>
        {:else}
            <p class="px-3 text-white/80 text-clip">the frogfest app :3</p>
        {/if}
    </div>

    <div class="flex h-full flex-1 justify-end gap-1 items-center">
        <ObsStatusChip />

        <button
            type="button"
            class="hover:bg-gray-700 ml-3"
            on:click={() => window.api.winMinimize()}
        >
            <Fa icon={faMinus} />
        </button>
        <button
            type="button"
            class="hover:bg-red-700"
            on:click={() => window.api.winClose()}
        >
            <Fa icon={faClose} />
        </button>
    </div>
</header>
<About {version} bind:isOpen />
<Options bind:isOpen={optionIsOpen} />

<style lang="postcss">
header {
    -webkit-app-region: drag;
    @apply flex w-full items-center justify-between px-2 py-0.5;
    @apply h-10;
}
button {
    @apply rounded px-2 py-1;
    -webkit-app-region: no-drag;
}

.badge {
    @apply w-[12rem] rounded-full bg-slate-700;
}
.badge-playing {
    width: 15rem;
}
.concert {
    @apply bg-purple-900 font-bold;
    background-size: 80%;
    background-image: linear-gradient(
            to bottom,
            rgba(22, 29, 19, 0.4),
            rgba(22, 29, 19, 0.4)
        ),
        var(--frog-concert);
}

.concert.badge-playing {
    @apply w-[17rem];
}
</style>
