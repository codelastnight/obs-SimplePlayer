<script>
import { crossfade, fade } from 'svelte/transition';
import { quintOut } from 'svelte/easing';
import Playlist from './Playlist.svelte';
import { isPlaying } from './store';
const eAPI = window.api;
let isOpen = false;
let playlist;
let path = '';
const [send, receive] = crossfade({
    duration: (d) => Math.sqrt(d * 200),

    fallback(node, params) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;

        return {
            duration: 600,
            easing: quintOut,
            css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`
        };
    }
});

eAPI.onPlaylistChanged(async (_, data) => {
    if ($isPlaying) isPlaying.set(false);
    if (!data.done) {
        playlist = [];
        console.log('playlist load');
        const getpath = await eAPI.dataGet('path');
        if (!getpath?.data) return;
        path = getpath.data;
    }
});
</script>

{#if isOpen}
    <article class="wrapper">
        <div
            class="container"
            in:receive={{ key: 'standby' }}
            out:send={{ key: 'standby' }}
        >
            <button on:click={() => (isOpen = !isOpen)}>click</button>
            <Playlist bind:playlist title="standby list" />
        </div>

        <div class="backdrop" transition:fade></div>
    </article>
{:else}
    <div
        class="bg-blue-900"
        in:receive={{ key: 'standby' }}
        out:send={{ key: 'standby' }}
    >
        <button on:click={() => (isOpen = !isOpen)}>click</button>
    </div>
{/if}

<style lang="postcss">
.wrapper {
    @apply absolute left-0 top-0  z-0 h-full w-full;
}
.backdrop {
    @apply left-0 top-0 z-0 h-full w-full bg-stone-900/75;
}
.container {
    @apply absolute z-10  mt-10 h-full w-full bg-blue-900;
    @apply rounded-xl;
}
</style>
