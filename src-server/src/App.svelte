<script lang="ts">
import Lily from './lib/Lily.svelte';
import { io } from 'socket.io-client';

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
    <div>
        <Lily />
        <p>{title}</p>
        <p>{tracklisting}</p>
    </div>
</main>

<style>
main {
    display: flex;
    justify-items: flex-end;
    flex-direction: column;
}
</style>
