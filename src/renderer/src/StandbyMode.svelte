<script>
import { fade, fly } from 'svelte/transition';
import Playlist, { onPlaylistAdd } from './Playlist.svelte';
import { activePlaylist, isPlaying } from './store';
import { onMount } from 'svelte';
import Fa from 'svelte-fa';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
const eAPI = window.api;
let isOpen = false;
let playlist;
let path = '';
const type = 'standby';

onMount(() => {
    async function checkSettings() {
        const getpath = await eAPI.dataGet(type);
        if (!!getpath && getpath.type === 'ok') {
            if (!getpath.data) return;
            eAPI.handleScanDir(type, getpath.data);
            path = getpath.data;
        }
    }
    checkSettings();
});

eAPI.onPlaylistChanged(async (_, data) => {
    if (data.type !== type) return;
    if (data.loading) {
        if ($isPlaying) isPlaying.set(false);

        playlist = [];
        console.log('playlist load');
        const getpath = await eAPI.dataGet(type);
        if (!getpath?.data) return;
        path = getpath.data;
    } else {
        if (isOpen) activePlaylist.set({ type, playlist });
    }
});
eAPI.onPlaylistAdd(async (_, data) => {
    playlist = onPlaylistAdd(type, playlist, data);
});
</script>

{#if isOpen}
    <article class="wrapper">
        <div class="container" transition:fly={{ y: 200, duration: 300 }}>
            <button
                class="toggle rounded-t-xl"
                on:click={() => (isOpen = !isOpen)}
            >
                Close
                <Fa icon={faChevronDown} />
            </button>

            <Playlist
                {path}
                bind:playlist
                title="standby list"
                type="standby"
            />
        </div>

        <div class="backdrop" transition:fade={{ duration: 300 }}></div>
    </article>
{:else}
    <div class="bg-blue-900 rounded-t-xl">
        <button
            class="toggle"
            class:invisible={isOpen}
            on:click={() => (isOpen = !isOpen)}
        >
            Open Standby Playlist
            <Fa icon={faChevronUp} />
        </button>
    </div>
{/if}

<style lang="postcss">
.toggle {
    @apply flex w-full items-center justify-center gap-3 px-3 py-1;
}
.toggle:hover {
    @apply bg-gray-800;
}
.wrapper {
    @apply absolute left-0 top-0  z-0 h-full w-full;
}
.backdrop {
    @apply left-0 top-0 z-0 h-full w-full bg-stone-900/75;
}
.container {
    @apply absolute z-10  mt-7 h-full w-full bg-blue-900;
    @apply rounded-xl;
}
</style>
