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
<div id="playlist" class="flex flex-col  w-full py-4  divide-y divide-slate-500 bg-slate-700 rounded-2xl h-min-100 h-100 ">
    <div class="flex justify-between items-center px-4  py-2">
        <h1 class="font-bold text-xl ">Playlist</h1>
        <button class="bg-slate-800 hover:bg-slate-900 rounded-full py-2 px-4" on:click={()=> window.electronAPI.openDir()}>Open folder</button>
    </div>
    {#each list as song, index  (song.index)}
        <!-- svelte-ignore a11y-invalid-attribute -->
        <button
            
            class="w-full cursor-pointer text-white  py-4 px-4 text-start hover:bg-slate-600"
            on:click={changeSong(song.index)}
            >
            
               <span class="font-md truncate "> {song.name}</span>
                
                <small class="text-sm">{song.artist}</small>
           
        </button>
    {/each}
</div>
