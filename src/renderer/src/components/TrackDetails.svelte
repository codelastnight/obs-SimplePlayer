<script lang="ts">
import type { ClientSong } from '../Player.svelte';
import { activePlaylist } from '../store';

export let song: ClientSong;
export let setlist: string[] = ['testt1', 'test2'];
</script>

{#if $activePlaylist.type === 'track'}
    <div id="title" class="">
        <h1 id="track" class="text-lg">
            DJ {'->'} <span class="font-bold">{song?.title || ''}</span>
        </h1>
        {#each setlist as text, index (index)}
            <p>{index === 0 ? '' : '+'} {text}</p>
        {/each}
        <p></p>
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
