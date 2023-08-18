<script lang="ts">
const images = ['/frog_smug.png', '/frog_talk.png'];

const states: { [key: string]: stateData } = {
    idle: {
        src: images[0],
        class: 'idle'
    },
    prespeak: {
        src: images[1],
        class: 'peek'
    },
    speak: {
        src: images[0]
    }
};
type State = keyof typeof states;

export let state: State = 'idle';

interface stateData {
    src: string;
    class?: string;
}
</script>

<div class="peek">
    <img
        class="froggie {states[state]?.class}"
        src={states[state].src}
        alt="magical froggie lily chibi"
    />
</div>

<style>
.froggie {
    width: 6rem;
}
.idle {
    transform: translateY(6rem);
}
.peek {
    animation-name: peek;
    animation-duration: 1s;
    transition-timing-function: ease-in;
}
@keyframes peek {
    0%,
    40% {
        transform: translateY(6rem);
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
