<script>
import Fa from 'svelte-fa';
import { faClose, faMinus } from '@fortawesome/free-solid-svg-icons';
import Dialog from './Dialog.svelte';


let dialog
</script>

<style lang="postcss">
header {
    -webkit-app-region: drag;
    @apply w-full px-1 py-0.5 flex justify-between items-center;
}
button {
    @apply px-2 py-1 rounded;
    -webkit-app-region: no-drag;
}
button p {
    @apply text-xs;
}
</style>

<header>
    <div class="flex-1" >
        <button
            type="button"
            class="hover:bg-slate-800"
            on:click={() => dialog.showModal()}
        >
           <p>about</p>
        </button>
    </div>
    <p class="px-3 py-1">the frogfest app :3</p>
    <div class="flex h-full flex-1 justify-end gap-1">
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
<Dialog bind:dialog on:close={() => console.log('closed')} >
    <div class="flex flex-col items-center h-[50vh] w-[50vw] justify-center">
        <img src="/logo.jpg" alt="frog logo" width="100rem" />
        <h1 class="font-bold text-2xl mb-3">Frog Player :3</h1>
        <p>i love frogs!!!!</p>

        <p>made with 🐸 by <a href="https://artsandcrafts.work" class="underline text-blue-500">arts + crafts</a></p>
    </div>
</Dialog>
