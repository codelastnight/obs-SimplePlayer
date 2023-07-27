<script lang="ts">
import { createEventDispatcher } from 'svelte';
import Fa from 'svelte-fa';
import { faFrog, faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import type { ClientSong } from './Player.svelte';
let search = '';
export let playlist: ClientSong[];
export let song: ClientSong;
$: list = filterPlaylist(playlist);

const dispatch = createEventDispatcher();
function filterPlaylist(playerObj) {
    if (!playerObj) return [];

    const list = playerObj.filter(
        (song) =>
            (song.name + song.artist)
                .toLowerCase()
                .indexOf(search.toLowerCase()) !== -1
    );
    return list;
}
function changeSong(number) {
    dispatch('changeSong', {
        index: number
    });
}
</script>

<style lang="postcss">
::-webkit-scrollbar {
    width: 10px;
}

/* Track */
::-webkit-scrollbar-track {
    /* box-shadow: inset 0 0 5px grey;  */
    @apply bg-amber-200/10;
}

/* Handle */
::-webkit-scrollbar-thumb {
    background: #60b458;
    border-radius: 5px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
    background: rgb(65, 189, 137);
}
.container {
    @apply flex flex-col h-full w-full pb-3 overflow-hidden;
    @apply  divide-y divide-stone-600 ;

   
}

.primary {
    @apply bg-amber-800/30 rounded-full py-2 px-4 flex gap-x-2 items-center;
}
.primary:hover {
    @apply bg-amber-800/75;
}
</style>

<div class="container">
    <div class="flex justify-between items-center px-3 py-3">
        <h1 class="font-bold text-xl flex gap-x-2 items-center">
            <Fa icon={faFrog} />
            Track List
        </h1>
        {#if list.length !== 0}
            <button
                class="primary"
                on:click={() => window.api.openDir()}
            >
                Open folder
                <Fa icon={faFolderOpen} />
            </button>
        {/if}
    </div>

    {#if list.length === 0}
        <div class="grid place-items-center w-full h-1/2">
            <div class="flex flex-col items-center gap-2">
                <p >click "open folder" 2 get started 🐸</p>
                <button
                    class="primary"

                    on:click={() => window.api.openDir()}
                >
                    Open folder
                    <Fa icon={faFolderOpen} />
                </button>
            </div>
        </div>
    {:else}
        <div class="h-full overflow-y-auto divide-y divide-stone-600">
            {#each list as track (track?.index)}
                <!-- svelte-ignore a11y-invalid-attribute -->
                <button
                    class="w-full cursor-pointer flex gap-x-2 items-center py-3 px-3 text-start hover:bg-amber-900/10 truncate"
                    on:click={() => changeSong(track?.index)}
                >
                    {#if song.index === track?.index}
                        <div class="w-[25px]">🐸</div>
                    {:else}
                        <div class="w-[25px]" />
                    {/if}
                    <div class="truncate w-full">
                        <p class={`font-md truncate w-full ${song.index === track?.index ?'text-white font-bold ' :'' }`}>{track.title}</p>

                        <p class="text-sm">{track.artist || '-----'}</p>
                    </div>
                </button>
            {/each}
        </div>
    {/if}
</div>
