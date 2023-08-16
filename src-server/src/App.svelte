<script lang="ts">
import Froggie from './lib/Froggie.svelte';
import Lily from './lib/Lily.svelte';
import { io } from 'socket.io-client';
import Textbox from './lib/Textbox.svelte';
import type { OBSData } from '../../src/renderer/src/components/OBSSettings.svelte';
const socket = io();
const delay = 2000; //120000

let title = 'DJ: RONSROGUE';
let tracklisting = ['test1', 'test2'];

socket.on('onload', function (msg) {
    socket.emit('whoiam', 'reciever');
});
socket.on('whouare', function (msg) {
    socket.emit('ask4update', 'pls');
});
socket.on('update', function (msg: OBSData) {
    console.log(msg);

    title = msg.title;
    tracklisting = msg.track;
});
socket.on('disconnect', function () {
    title = 'disconnected';
    tracklisting = ['try refreshing browser source or app?'];
});
</script>

<main>
    <div class="flex">
        <Lily state="listen" />
        <Textbox classes="lilybox">
            <p><b>{title}</b></p>
            {#each tracklisting as text, index (index)}
                {#if index === 0}
                    <p class="italic">{text}</p>
                {:else}
                    <p class="italic">+ {text}</p>
                {/if}
            {/each}
        </Textbox>
    </div>
    <div>
        <Textbox position="bottom">
            <p>yumsicle</p>
        </Textbox>
        <Froggie />
    </div>
</main>

<style>
p {
    all: unset;
    display: block;
}
.italic {
    font-style: italic;
}
main {
    position: fixed;
    bottom: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    align-items: flex-end;
    padding-right: 3rem;
}
.flex {
    display: flex;
}
:global(.lilybox) {
    margin-top: 3rem;
    min-width: 15rem;
}
</style>
