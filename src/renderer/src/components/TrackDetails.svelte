<script lang="ts">
import type { ClientSong } from '../Player.svelte';
export let song: ClientSong;
</script>

<div id="title" class="text-center">
    <h1 id="track" class="text-lg font-bold">{song?.title || ''}</h1>
    <h2 id="artist">
        {song?.artist || ''}
    </h2>
    <h3><small id="album">{song?.album || ''}</small></h3>
</div>
