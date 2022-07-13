<script>
import { createEventDispatcher } from 'svelte';

let search = '';
export let player;

$: list = player
    ? player.playlist.filter(
          (item) =>
              (item.name + item.artist)
                  .toLowerCase()
                  .indexOf(search.toLowerCase()) !== -1
      )
    : [];

const dispatch = createEventDispatcher();

function changeSong(number) {
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
<div id="playlist" class="flex flex-col gap-y-3 w-full px-4 py-4 bg-slate-800 rounded-xl h-full">
    <h1 class="font-bold text-xl">Playlist</h1>
    {#each list as song, index (song.index)}
        <!-- svelte-ignore a11y-invalid-attribute -->
        <button
            
            class="w-full cursor-pointer text-white  py-2 px-3 text-start bg-slate-700 rounded-lg hover:bg-slate-600"
            on:click={changeSong(song.index)}
            >
            
               <span class="font-md truncate "> {song.name}</span>
                
                <small class="text-sm">{song.artist}</small>
           
        </button>
    {/each}
</div>
