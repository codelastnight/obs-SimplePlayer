<script lang="ts">
import Textbox from './Textbox.svelte';
import { scale, fade } from 'svelte/transition';
const images = ['/frog_smug.png', '/frog_talk.png'];

const states: { [key: string]: stateData } = {
    idle: {
        src: images[0],
        class: 'idle'
    },
    prespeak: {
        src: images[1],
        class: 'peek bob'
    },
    spoke: {
        src: images[0],
        class: 'bob'
    }
};
type State = keyof typeof states;
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export let state: State = 'idle';
export let frogspeak = '';
$: onSpeechSet(frogspeak);
function onSpeechSet(text) {
    if (!text || text === '') state = 'idle';
    else state = 'prespeak';
}

$: onStateChange(state);
async function onStateChange(s) {
    if (s === 'prespeak') {
        await delay(1000);
        if (s !== 'prespeak') return;
        state = 'spoke';
    } else if (s === 'spoke') {
        await delay(10000);
        if (s !== 'spoke') return;
        state = 'idle';
    }
}
interface stateData {
    src: string;
    class?: string;
}
</script>

<div class="peek">
    <div class="flex {states[state]?.class}">
        {#if !!frogspeak && state !== 'idle'}
            <div class="textbox" in:scale={{ delay: 300 }} out:fade>
                <Textbox position="bottom">
                    <p class="sm">{frogspeak}</p>
                </Textbox>
            </div>
        {/if}
        <img
            class="froggie"
            class:frogidle={state === 'idle'}
            src={states[state].src}
            alt="magical froggie lily chibi"
        />
    </div>
</div>

<style>
.textbox {
    position: absolute;
    top: 0.2rem;
    right: 5rem;
    width: max-content;
    max-width: 50ch;
}
.bob {
    animation-name: bob;
    animation-duration: 0.5s;
    animation-direction: alternate;
    animation-timing-function: steps(2, jump-none);
    animation-iteration-count: infinite;
}
.frogidle {
    animation-name: idle;
    animation-duration: 2s;
    animation-timing-function: steps(2, jump-none);
    animation-iteration-count: infinite;
}
@keyframes bob {
    from {
        transform: translateY(-3px);
    }
    to {
        transform: translateY(0px);
    }
}
@keyframes idle {
    from {
        transform: scaleX(-1);
    }
    to {
        transform: scaleX(1);
    }
}
.flex {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}
.sm {
    font-size: 0.8rem;
    margin: 0;
    color: blue;
}
.froggie {
    width: 6rem;
    transition: transform 1s ease;
    margin-top: -1rem;
}
.idle {
    transform: translateY(5.5rem);
}
.peek {
    position: relative;
    animation-name: peek;
    animation-duration: 1s;
    transition-timing-function: ease-in;
}
@keyframes peek {
    0%,
    40% {
        transform: translateY(5rem);
    }
    50% {
        transform: translateY(-1rem);
    }
    60%,
    90%,
    100% {
        transform: translateY(0rem);
    }
    70% {
        transform: translateY(-0.5rem);
    }
}
</style>
