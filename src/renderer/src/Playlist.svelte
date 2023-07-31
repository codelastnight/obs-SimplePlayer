<script lang="ts">
import Fa from 'svelte-fa';
import { faFrog } from '@fortawesome/free-solid-svg-icons';
import { handleConfirm } from './components/ModalConcert.svelte';
import FileLoadButton from './components/FileLoadButton.svelte';
import type { ClientSong } from './Player.svelte';
import { song } from './store';
export let playlist: ClientSong[];
export let title = 'Track List';
export let path = '';

let loading;
let search = '';
const eAPI = window.api;

$: list = filterPlaylist(playlist);

function filterPlaylist(playerObj) {
    if (!playerObj) return [];

    const list = playerObj.filter(
        ($song) =>
            ($song.name + $song.artist)
                .toLowerCase()
                .indexOf(search.toLowerCase()) !== -1
    );
    return list;
}
function changeSong(number) {
    handleConfirm('change song', () => {
        song.set(playlist.find((item) => item.index === number));
    });
}

eAPI.onPlaylistChanged(async (_, data) => {
    loading = !data.done;
    if (!loading) {
        song.set(playlist[0]);
        console.log('playlist finish load');
    }
});
eAPI.onPlaylistAdd(async (_, metadata) => {
    if (!playlist) return;
    if (playlist.some((item) => item.filePath === metadata.filePath)) return;

    const i = playlist.length;

    playlist = [
        ...playlist,
        {
            ...metadata,
            index: i
        }
    ];
});
eAPI.onPlaylistRemoved((_, path) => {
    if (!playlist) return;

    const remIndex = playlist.findIndex((x) => x.filePath == path);
    if (remIndex == -1) return;

    playlist.splice(remIndex, 1);
    playlist = playlist;
});
</script>

<div class="container">
    <div class="flex justify-between items-center px-3 py-3">
        <div>
            <h1 class="font-bold text-xl flex gap-x-2 items-center">
                <Fa icon={faFrog} />
                {title}
                <span
                    class="text-sm font-normal px-3 py-0.5 bg-gray-600/25 rounded-full"
                >
                    {list.length}
                </span>
            </h1>
            <p class="text-xs text-white/75">{path}</p>
        </div>
        {#if list.length !== 0}
            <FileLoadButton showReload {path} />
        {/if}
    </div>

    {#if list.length === 0}
        <div class="grid place-items-center w-full h-1/2">
            <div class="flex flex-col items-center gap-2">
                <p>click "open folder" 2 get started 🐸</p>
                <FileLoadButton {path} />
            </div>
        </div>
    {:else}
        <div
            class="h-full overflow-y-auto divide-y divide-stone-600 border-t border-stone-600"
        >
            {#each list as track (track?.index)}
                <!-- svelte-ignore a11y-invalid-attribute -->
                <button
                    class="w-full cursor-pointer flex gap-x-2 items-center py-3 px-3 text-start hover:bg-amber-900/10 truncate"
                    on:click={() => changeSong(track?.index)}
                >
                    {#if $song && $song?.index === track?.index}
                        <div class="w-[25px]">🐸</div>
                    {:else}
                        <div class="w-[25px]" />
                    {/if}
                    <div class="truncate w-full">
                        <p
                            class={`font-md truncate w-full ${
                                $song?.index === track?.index
                                    ? 'text-white font-bold '
                                    : ''
                            }`}
                        >
                            {track.title}
                        </p>

                        <p class="text-sm">{track.artist || '-----'}</p>
                    </div>
                </button>
            {/each}
        </div>
    {/if}
</div>

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
    @apply flex h-full w-full flex-col overflow-hidden pb-3;
}
</style>
