<script lang="ts">
import type { ClientSong } from '../Player.svelte';
import { formatTime } from '../helpers';
import { activePlaylist } from '../store';
import Dialog from './Dialog.svelte';

export let song: ClientSong;
export let currentTracks: string[] = ['testt1', 'test2'];
export let trackListRaw;
let isOpen = false;

let doesTrackListExist = 'loading';
window.api.onTrackListGet((_, data) => {
    if (data.type !== 'ok') {
        doesTrackListExist = 'fail';
        return;
    }
    doesTrackListExist = 'ok';
});
function reload() {
    const path = song.filePath;

    window.api.getTrackList(path);
}
</script>

<div class="text-xs p flex h-fit">
    {#if doesTrackListExist === 'ok'}
        <p class="px-2 py-1 rounded-l-full bg-green-700">tracklist found!</p>
        <button
            class="px-1 bg-green-600 hover:bg-gray-500 rounded-r-full"
            on:click={() => (isOpen = true)}
        >
            view list
        </button>
    {:else}
        <p class="px-2 py-1 rounded-full bg-gray-600">no tracklist found</p>
    {/if}
    <button class="px-1 ml-1 hover:bg-gray-600 rounded-full" on:click={reload}>
        reload
    </button>
</div>
{#if $activePlaylist.type === 'track'}
    <div id="title" class="">
        <h1 id="track" class="text-lg">
            DJ {'->'} <span class="font-bold">{song?.title || ''}</span>
        </h1>
        <div class="flex justify-between">
            <div>
                {#each currentTracks as text, index (index)}
                    <p class="text-xs">{index === 0 ? '' : '+'} {text}</p>
                {/each}
            </div>
        </div>
    </div>
{:else}
    <div id="title" class="text-center">
        <h1 id="track" class="text-lg font-bold">{song?.title || ''}</h1>
        <h2 id="artist">
            {song?.artist || ''}
        </h2>
        <h3><small id="album">{song?.album || ''}</small></h3>
    </div>
{/if}
<Dialog bind:isOpen title="tracklist">
    <div class="flex flex-col h-[50vh] w-[50vw] overflow-y-auto">
        {#if !!trackListRaw}
            {#each Object.entries(trackListRaw) as [timestamp, text]}
                <div class="listitem grid gap-x-2 mb-3 text-sm">
                    <p class="text-purple-100/75 text-right">
                        {formatTime(parseInt(timestamp))}
                    </p>
                    <p>{text}</p>
                </div>
            {/each}
        {/if}
    </div>
</Dialog>

<style>
.listitem {
    grid-template-columns: 3rem auto;
}
</style>
