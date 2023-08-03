<script>
import { Howler } from 'howler';
import { onMount, onDestroy } from 'svelte';
import Fa from 'svelte-fa';
import {
    faVolumeMute,
    faVolumeHigh,
    faWarning
} from '@fortawesome/free-solid-svg-icons';
import { concertMode } from './store';
import Switch from './components/Switch.svelte';

let slider = 50;
let mute;

const eAPI = window.api;
let concert = false;
$: concertMode.set(concert);

onMount(() => {
    async function checkSettings() {
        const settings = await eAPI.dataGet('options');

        if (!!settings && settings.type === 'ok') {
            if (!!settings.data.volume) slider = settings.data.volume;
            if (!!settings.data.mute) mute = settings.data.mute;
        }
    }

    checkSettings();
});
onDestroy(() => {
    setSettings();
});
eAPI.handleSaveSetting((_) => {
    setSettings();
    eAPI.handleClosed();
});
function togglemute() {
    if (mute) {
        mute = false;
        Howler.volume(slider / 100);
    } else {
        mute = true;
        Howler.volume(0);
    }
    setSettings();
}
function setSettings() {
    eAPI.dataSet({ key: 'options', value: { mute: mute, volume: slider } });
}
$: {
    Howler.volume(slider / 100);
    mute = false;
}
</script>

<div class=" flex justify-between w-full">
    <div class=" flex gap-x-1 items-center">
        <button
            type="button"
            title="mute volume"
            on:click={togglemute}
            class="btn btn-primary-outline btn-lg justify-content-end hover:bg-slate-700 py-2 px-4 rounded-full"
        >
            {#if mute}
                <Fa icon={faVolumeMute} class="w-[25px]" />
            {:else}
                <Fa icon={faVolumeHigh} class="w-[25px]" />
            {/if}
        </button>

        <input
            type="range"
            min="0"
            max="100"
            class="slider"
            bind:value={slider}
            on:change={setSettings}
            id="myRange"
        />
    </div>
    <div class:bg-purple-900={concert} class="rounded-full">
        <Switch flipLabel bind:checked={concert}>
            <span class="text-sm">Concert Mode</span>
        </Switch>
    </div>
</div>
<div class="tip" class:invisible={!concert}>
    <Fa class="mt-0.5" icon={faWarning} />
    <p>All actions will require an extra click</p>
</div>

<style lang="postcss">
.tip {
    @apply flex w-full items-center justify-end gap-1;
    @apply text-xs text-yellow-300/80;
}
</style>
