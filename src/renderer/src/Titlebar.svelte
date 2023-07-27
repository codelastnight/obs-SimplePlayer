<script>
import Fa from 'svelte-fa';
import { faClose, faMinus } from '@fortawesome/free-solid-svg-icons';
</script>

<style lang="postcss">
header {
    -webkit-app-region: drag;
    @apply w-full  flex justify-between items-center;
}
button {
    @apply h-full px-3 py-2;
    -webkit-app-region: no-drag;
}
</style>

<header>
    <div class="flex-1" />
    <p class="px-3 py-1">the frogfest app :3</p>
    <div class="flex h-full flex-1 justify-end">
        <button
            type="button"
            class="hover:bg-slate-800"
            on:click={() => window.api.winMinimize()}
        >
            <Fa icon={faMinus} />
        </button>
        <button
            type="button"
            class="hover:bg-red-800"
            on:click={() => window.api.winClose()}
        >
            <Fa icon={faClose} />
        </button>
    </div>
</header>
