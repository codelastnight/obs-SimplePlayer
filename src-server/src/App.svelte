<script lang="ts">
import Froggie from './lib/Froggie.svelte';
import Lily from './lib/Lily.svelte';
import { io } from 'socket.io-client';
import Textbox from './lib/Textbox.svelte';

const socket = io();
const delay = 2000; //120000

let timerId = setTimeout(animstart, delay);
let title = 'test';
let tracklisting = 'test2';
function animstart() {
    // const animate = randomize(animList)[0]
    // main.classList.add(animate)
    // timerId = setTimeout(() => animend(animate), 2000);
}

socket.on('onload', function (msg) {
    clearTimeout(timerId);
    timerId = setTimeout(animstart, delay);

    socket.emit('whoiam', 'reciever');
});
socket.on('whouare', function (msg) {
    socket.emit('ask4update', 'pls');
});
socket.on('update', function (msg) {
    console.log(msg);

    if (!msg.animRand) clearTimeout(timerId);
    else {
        clearTimeout(timerId);
        timerId = setTimeout(animstart, delay);
    }

    title = msg.title;
    tracklisting = msg.track;
});
socket.on('disconnect', function () {
    title = 'disconnected';
    tracklisting = 'try refreshing browser source or app?';
    clearTimeout(timerId);
});
</script>

<main>
    <div class="flex">
        <Lily state="listen" />
        <Textbox classes="lilybox">
            <p>{title}</p>
            <p>{tracklisting}</p>
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
