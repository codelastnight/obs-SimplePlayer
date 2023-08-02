<script lang="ts">
import { handleConfirm } from './ModalConcert.svelte';
import Fa from 'svelte-fa';
import {
    faFolderOpen,
    faCircleNotch,
    faRefresh
} from '@fortawesome/free-solid-svg-icons';

export let path = '';
export let showReload = false;
export let type: 'standby' | 'track';
let loading;

const eAPI = window.api;

function reloadFolder() {
    console.log(path, type);
    handleConfirm('reload folder', () => {
        if (!path) return;
        eAPI.handleScanDir(type, path);
    });
}
function openFolder() {
    handleConfirm('open folder', () => {
        eAPI.openDir(type);
    });
}
eAPI.onPlaylistChanged(async (_, data) => {
    if (data.type !== type) return;
    loading = data.loading;
});
</script>

{#if !loading}
    <div class="flex gap-1">
        {#if showReload}
            <button
                class="px-2 py-1 rounded-full hover:bg-gray-800 active:bg-amber-800"
                on:click={reloadFolder}
                title="Reload current folder"
            >
                <Fa icon={faRefresh} />
            </button>
        {/if}
        <button
            class="primary text-sm"
            on:click={openFolder}
            title="Load files from your computer"
        >
            Open folder
            <Fa icon={faFolderOpen} />
        </button>
    </div>
{:else}
    <button
        class="primary text-sm"
        on:click={() => window.api.cancelScanDir(type)}
    >
        <Fa icon={faCircleNotch} size="sm" spin={true} />
        Cancel Loading
    </button>
{/if}

<style lang="postcss">
.primary {
    @apply flex items-center gap-x-2 rounded-full bg-amber-800/30 px-4 py-2;
}

.primary:hover {
    @apply bg-amber-800/75;
}
.primary:active {
    @apply bg-amber-800;
}
</style>
