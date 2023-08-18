<script lang="ts">
import { onMount } from 'svelte';

const images = ['/lily_listen_sm.png', '/lily_talk.gif', '/lily_idle_sm.png'];

interface stateData {
    src: string;
    class: string;
}

const states: { [key: string]: stateData } = {
    idle: {
        src: images[2],
        class: ''
    },
    talk: {
        src: images[1],
        class: 'talk'
    },
    listen: {
        src: images[0],
        class: 'listen'
    }
};
type State = keyof typeof states;
export let state: State = 'talk';
export let defaultState: State = 'listen';

const motionStates = ['rotate', 'bounce', 'shake', 'spinZ'];
let count = 0;

$: src = states[state].src;

$: talking(state);

let timeout;

const delayVal = 200;
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function talkAnim() {
    for (let i = 0; i < 9; i++) {
        src = src === images[1] ? images[2] : images[1];
        await delay(delayVal);
    }
    state = defaultState;
}
async function talking(s) {
    if (s === 'talk') {
        src = images[1];
        await delay(1000);
        state = defaultState;
    } else {
    }
}

onMount(() => {
    timeout = setTimeout(function tick() {
        let index = (count + 1) % motionStates.length;

        count = index;
        timeout = setTimeout(tick, 5000);
    }, 5000);

    return () => {
        clearTimeout(timeout);
    };
});
</script>

<div class:bob={state !== 'listen'}>
    <div class="movement {state === 'listen' ? motionStates[count] : ''}">
        <img
            class="lily {states[state].class}"
            {src}
            alt="magical froggie lily chibi"
        />
    </div>
</div>

<style>
.lily {
    width: 10rem;
    animation-iteration-count: infinite;
}
.talk {
    transform: scaleX(-1);
}
.listen {
    animation-name: listen;
    animation-duration: 2s;
    animation-timing-function: steps(2, jump-none);
}
.bob {
    animation-name: bob;
    animation-duration: 0.7s;
    animation-direction: alternate;
    animation-timing-function: steps(2, jump-none);
    animation-iteration-count: infinite;
}

.movement {
    animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
    animation-iteration-count: 1;
}
.rotate {
    animation-name: rotate;
    animation-duration: 1s;
    animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.bounce {
    animation-name: bounceIn;
    animation-duration: 1s;
    transition-timing-function: ease-in;
}

.shake {
    animation: shake 0.35s ease-in-out 0s 3;
}
.spinZ {
    transform-style: preserve-3d;
    animation: spinZ 1.2s ease-in-out;
}
@keyframes rotate {
    0%,
    60% {
        transform: scaleX(-1);
    }
    25%,
    100% {
        transform: scaleX(1);
    }
}
@keyframes bounceIn {
    0%,
    30%,
    60%,
    80%,
    100% {
        transform: translateY(0);
        opacity: 1;
    }
    40% {
        transform: translateY(-50px);
    }
    70% {
        transform: translateY(-15px);
    }
    90% {
        transform: translateY(-5px);
    }
}
@keyframes bob {
    from {
        transform: translateY(-3px);
    }
    to {
        transform: translateY(0px);
    }
}
@keyframes listen {
    from {
        transform: scaleX(-1);
    }
    to {
        transform: scaleX(1);
    }
}
@keyframes shake {
    0% {
        transform: translateX(0);
    }
    25% {
        transform: translateX(5px);
    }
    50% {
        transform: translateX(-5px);
    }
    75% {
        transform: translateX(5px);
    }
    100% {
        transform: translateX(0);
    }
}
@keyframes spinZ {
    0% {
        transform: rotateZ(0deg);
    }
    100% {
        transform: rotateZ(360deg);
    }
}
</style>
