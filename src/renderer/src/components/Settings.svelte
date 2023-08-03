<script>
export let isOpen;

import Dialog from './Dialog.svelte';
import { settings } from '../store';
import Switch from './Switch.svelte';
import { faWarning } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';
import { onDestroy } from 'svelte';

onDestroy(() => {
    window.api.dataSet({
        key: 'settings',
        value: $settings
    });
});
</script>

<Dialog bind:isOpen title="options">
    <div class="flex flex-col h-[50vh] w-[50vw]">
        <h2 class=" mb-1">General</h2>

        <Switch spaceBetween flipLabel bind:checked={$settings.frogMode}>
            <span class="">Frog Mode</span>
        </Switch>
        <div class="tip ml-3 mb-1">
            <Fa class="mt-0.5" icon={faWarning} />
            {#if $settings.frogMode}
                <p>if you turn this off you are a loser btw</p>
            {:else}
                <p>loooserrr</p>
            {/if}
        </div>
        <Switch spaceBetween flipLabel bind:checked={$settings.fade}>
            <span class="">Fade between songs</span>
        </Switch>
        <div
            class="flex justify-between pl-6 px-1 items-center"
            class:disabled={!$settings.fade}
        >
            <span class="text-sm text-purple-100/75">Fade duration (in ms)</span
            >

            <input
                class="bg-slate-600 px-2 text-sm py-0.5 rounded-full"
                type="number"
                bind:value={$settings.fadeValue}
                min="0"
                max="5000"
            />
        </div>
        <h2 class=" mb-2 mt-3">Playlist</h2>
        <div class="grid grid-cols-2 gap-2">
            <div class="px-3 py-2 bg-primary border border-gray-800 rounded-lg">
                <h3 class="">Track</h3>
                <Switch
                    flipLabel
                    spaceBetween
                    bind:checked={$settings.track.autoplay}
                >
                    <span class="text-sm">Autoplay</span>
                </Switch>
            </div>
            <div
                class="px-3 py-2 bg-blue-900 border border-gray-800 rounded-lg"
            >
                <h3 class="">Standby</h3>

                <Switch
                    flipLabel
                    spaceBetween
                    bind:checked={$settings.standby.autoplay}
                >
                    <span class="text-sm">Autoplay</span>
                </Switch>
            </div>
        </div>
    </div>
</Dialog>

<style lang="postcss">
.tip {
    @apply flex w-full items-center gap-1;
    @apply text-xs text-yellow-300/80;
}
.disabled {
    opacity: 0.5;
    pointer-events: none;
}
</style>
