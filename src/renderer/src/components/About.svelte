<script lang="ts">
export let version;
export let isOpen;

import Dialog from './Dialog.svelte';
import Fa from 'svelte-fa';
import Marquee from 'svelte-fast-marquee';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

let updateStatus = 'none';
const updateState = {
    none: 'check for updates',
    checking: 'looking for new update...',
    available: 'update found! downloading...',
    downloaded: 'updated downloaded. restart to install',
    unavailable: 'no updates found',
    error: 'error checking for update'
};
window.api.onAppUpdate((_, arg) => {
    updateStatus = arg.type;
});
function checkAppUpdate() {
    window.api.checkAppUpdate();
    updateStatus = 'checking';
}
</script>

<Dialog bind:isOpen fun on:close={() => (updateStatus = 'none')}>
    <div class="flex flex-col items-center h-[50vh] w-[50vw] justify-between">
        <div class="flex flex-col items-center">
            <img src="logo.jpg" alt="frog logo" width="100rem" />
            <h1 class="font-bold text-2xl mb-3">
                Frog Player :3
                <span class="text-white/75 font-normal text-xl">
                    v{version}
                </span>
            </h1>
            <p>i love frogs!!!!</p>
            <button
                type="button"
                class="bg-amber-700 hover:bg-neutral-900 disabled:opacity-80 disabled:pointer-events-none update"
                on:click={checkAppUpdate}
                disabled={updateStatus !== 'none'}
            >
                {#if updateStatus === 'checking' || updateStatus === 'available'}
                    <Fa icon={faCircleNotch} spin />
                {/if}
                <p>{updateState[updateStatus]}</p>
            </button>
        </div>

        <div class="flex flex-col items-center w-full">
            <p class="mb-1">
                made with 🐸 by <a
                    href="https://artsandcrafts.work"
                    target="_blank"
                    class="underline text-blue-500">arts + crafts</a
                >
            </p>
            <Marquee
                pauseOnClick={true}
                direction="left"
                play={true}
                speed={20}
            >
                <h1 class="px-4">FROG IS LIFE</h1>
                <h2 class="px-4">AMPHIBIAN ETERNAL BLISS</h2>
                <h1 class="px-4 uppercase">jewels of the rainforest</h1>
                <h1 class="px-4">[++BLESSED HEAVEN++]</h1>
            </Marquee>
        </div>
    </div>
</Dialog>

<style lang="postcss">
.update {
    @apply flex items-center gap-1 rounded-full px-3 py-1;
}
</style>
