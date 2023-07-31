<script>
import Fa from 'svelte-fa';
import {
    faClose,
    faMinus,
    faCircleNotch
} from '@fortawesome/free-solid-svg-icons';
import Dialog from './components/Dialog.svelte';
import Marquee from 'svelte-fast-marquee';
import { onMount } from 'svelte';
import ObsStatusChip from './components/ObsStatusChip.svelte';
import { concertMode, isPlaying } from './store';
export let songName;
let version;
let updateStatus = 'none';
let isOpen = false;
const updateState = {
    none: 'check for updates',
    checking: 'looking for new update...',
    available: 'update found! downloading...',
    downloaded: 'updated downloaded. restart to install',
    unavailable: 'no updates found',
    error: 'error checking for update'
};
window.api.onAppUpdate((_, arg) => {
    updateStatus = arg.type;
});
onMount(() => {
    async function getAboutData() {
        const aboutData = await window.api.getAboutData();
        version = aboutData?.version || '';
    }
    getAboutData();
});

function checkAppUpdate() {
    window.api.checkAppUpdate();
    updateStatus = 'checking';
}
</script>

<header>
    <div class="flex-1 text-xs flex gap-2 items-center">
        <button
            type="button"
            class="hover:bg-neutral-900"
            on:click={() => (isOpen = true)}
        >
            <p>about</p>
        </button>
        <p class="text-white/75">v{version}</p>
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
            class="hover:bg-neutral-800 ml-3"
            on:click={() => window.api.winMinimize()}
        >
            <Fa icon={faMinus} />
        </button>
        <button
            type="button"
            class="hover:bg-red-800"
            on:click={() => window.api.winClose()}
        >
            <Fa icon={faClose} />
        </button>
    </div>
</header>
<Dialog bind:isOpen fun on:close={() => (updateStatus = 'none')}>
    <div class="flex flex-col items-center h-[50vh] w-[50vw] justify-between">
        <div class="flex flex-col items-center">
            <img src="logo.jpg" alt="frog logo" width="100rem" />
            <h1 class="font-bold text-2xl mb-3">
                Frog Player :3
                <span class="text-white/75 font-normal text-xl">
                    v{version}
                </span>
            </h1>
            <p>i love frogs!!!!</p>
            <button
                type="button"
                class="bg-amber-700 hover:bg-neutral-900 disabled:opacity-80 disabled:pointer-events-none update"
                on:click={checkAppUpdate}
                disabled={updateStatus !== 'none'}
            >
                {#if updateStatus === 'checking' || updateStatus === 'available'}
                    <Fa icon={faCircleNotch} spin />
                {/if}
                <p>{updateState[updateStatus]}</p>
            </button>
        </div>

        <div class="flex flex-col items-center w-full">
            <p class="mb-1">
                made with 🐸 by <a
                    href="https://artsandcrafts.work"
                    target="_blank"
                    class="underline text-blue-500">arts + crafts</a
                >
            </p>
            <Marquee
                pauseOnClick={true}
                direction="left"
                play={true}
                speed={20}
            >
                <h1 class="px-4">FROG IS LIFE</h1>
                <h2 class="px-4">AMPHIBIAN ETERNAL BLISS</h2>
                <h1 class="px-4 uppercase">jewels of the rainforest</h1>
                <h1 class="px-4">[++BLESSED HEAVEN++]</h1>
            </Marquee>
        </div>
    </div>
</Dialog>

<style lang="postcss">
header {
    -webkit-app-region: drag;
    @apply flex w-full items-center justify-between px-1 py-0.5;
    @apply h-10;
}
button {
    @apply rounded px-2 py-1;
    -webkit-app-region: no-drag;
}
.update {
    @apply flex items-center gap-1 rounded-full px-3 py-1;
}

.badge {
    @apply w-[12rem] rounded-full bg-slate-700;
}
.badge-playing {
    width: 15rem;
}
.concert {
    @apply bg-purple-900;
}
.concert.badge-playing {
    @apply w-[17rem];
}
</style>
