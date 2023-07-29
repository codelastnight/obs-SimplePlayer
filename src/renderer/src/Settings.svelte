<script>
import { Howler } from 'howler';
import { onMount } from 'svelte';
import Fa from 'svelte-fa';
import {
    faVolumeMute,
    faVolumeHigh,
    faWarning
} from '@fortawesome/free-solid-svg-icons';
import { concertMode } from './store';

let slider = 50;
let mute;

const eAPI = window.api;
let concert = false;
$: concertMode.set(concert);

onMount(() => {
    async function checkSettings() {
        const settings = await eAPI.dataGet('settings');
        const getpath = await eAPI.dataGet('path');

        if (settings !== undefined && settings.type === 'ok') {
            if (settings.data.volume) slider = settings.data.volume;
        }

        if (getpath !== undefined && getpath.type === 'ok') {
            if (getpath.data.path !== undefined)
                eAPI.handleScanDir(getpath.data.path.toString());
        }
    }

    checkSettings();
});

eAPI.handleSaveSetting((_) => {
    eAPI.dataSet({
        key: 'settings',
        value: { mute: mute, volume: slider }
    });
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
    eAPI.dataSet({ key: 'settings', value: { mute: mute, volume: slider } });
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
            id="checkboxrn"
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
            id="myRange"
        />
    </div>
    <label
        class="flex items-center cursor-pointer relative rounded-full py-1 pl-3 pr-1 mr-1"
        class:concert
    >
        <span class="pr-2 text-sm">Concert Mode</span>

        <input
            bind:checked={concert}
            class="sr-only"
            role="switch"
            type="checkbox"
        />
        <div
            class="toggle-bg relative bg-slate-600 border border-slate-500 h-6 w-11 rounded-full"
        />
    </label>
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
input:checked + .toggle-bg:after {
    transform: translateX(100%);
    @apply border-gray-200 bg-gray-200;
}
input:checked + .toggle-bg {
    @apply border-green-300/25 bg-emerald-700;
}
.toggle-bg:after {
    content: '';
    @apply absolute left-[1px] top-[1px] h-5 w-5  rounded-full border border-gray-400 bg-gray-400 shadow-sm transition;
}

.concert {
    @apply bg-purple-900;
}
</style>
