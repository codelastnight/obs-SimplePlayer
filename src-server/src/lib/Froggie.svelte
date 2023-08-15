<script lang="ts">
const images = ['/frog_smug.png', '/frog_talk.png'];

const states = {
    idle: {
        src: images[0]
    },
    prespeak: {
        src: images[1]
    },
    speak: {
        src: images[0]
    }
};
type State = keyof typeof states;

export let state: State = 'idle';

interface stateData {
    src: string;
}
</script>

<img class="lily" src={states[state].src} alt="magical froggie lily chibi" />

<style>
.lily {
    width: 10rem;
}
</style>
