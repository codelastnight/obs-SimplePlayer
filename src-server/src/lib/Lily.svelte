<script lang="ts">
const images = ['/lily_listen.png', '/lily_talk.png'];

interface stateData {
    src: string;
    class: string;
}
const states: { [key: string]: stateData } = {
    idle: {
        src: images[1],
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
</script>

<img
    class="lily {states[state].class}"
    src={states[state].src}
    alt="magical froggie lily chibi"
/>

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
@keyframes listen {
    from {
        transform: scaleX(-1);
    }
    to {
        transform: scaleX(1);
    }
}
</style>
