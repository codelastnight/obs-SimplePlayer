<script>
import { createEventDispatcher } from 'svelte';
import Fa from 'svelte-fa';
import { faFrog, faFolderOpen } from '@fortawesome/free-solid-svg-icons';
let search = '';
export let player;
$: list = filterPlaylist(player);

let current = 0;
const dispatch = createEventDispatcher();
function filterPlaylist(playerObj) {
    if (!playerObj) return [];

    const list = playerObj.playlist.filter(
        (song) =>
            (song.name + song.artist)
                .toLowerCase()
                .indexOf(search.toLowerCase()) !== -1
    );
    return list;
}
function changeSong(number) {
    current = number;
    dispatch('changeSong', {
        index: number
    });
}
</script>

<!-- <input
    class="form-control"
    id="search"
    type="search"
    bind:value={search}
    placeholder="Search"
    aria-label="Search" /> -->
<div
    id="playlist"
    class="flex flex-col h-full w-full pb-3 overflow-hidden divide-y divide-slate-500 bg-slate-700 rounded-2xl h-min-100 h-100 border border-slate-600"
>
    <div class="flex justify-between items-center px-4 py-4">
        <h1 class="font-bold text-xl flex gap-x-2 items-center">
            <Fa icon={faFrog} />
            Playlist
        </h1>
        <button
            class="bg-slate-800 hover:bg-slate-900 rounded-full py-2 px-4 flex gap-x-2 items-center"
            on:click={() => window.api.openDir()}
        >
            Open folder
            <Fa icon={faFolderOpen} />
        </button>
    </div>

    {#if list.length === 0}
        <div class="grid place-items-center w-full h-1/2">
            <p>click "open folder" 2 get started 🐸</p>
        </div>
    {:else}
        <div class="h-full overflow-y-scroll divide-y divide-slate-500">
            {#each list as song (song.index)}
                <!-- svelte-ignore a11y-invalid-attribute -->
                <button
                    class="w-full cursor-pointer text-white flex gap-x-2 items-center py-4 px-4 text-start hover:bg-slate-600 truncate"
                    on:click={() => changeSong(song.index)}
                >
                    {#if current === song.index}
                        <div class="w-[25px]">🐸</div>
                    {:else}
                        <div class="w-[25px]" />
                    {/if}
                    <div class="truncate w-full">
                        <p class="font-md truncate w-full">{song.name}</p>

                        <p class="text-sm">{song.artist}</p>
                    </div>
                </button>
            {/each}
        </div>
    {/if}
</div>
