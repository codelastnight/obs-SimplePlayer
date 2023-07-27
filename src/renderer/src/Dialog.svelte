<script>
	export let dialog
    export let title = ''
    import Fa from 'svelte-fa';
    import { faClose } from '@fortawesome/free-solid-svg-icons';
</script>
<style lang="postcss">
    dialog {
        @apply bg-slate-800/50 border border-gray-600 min-w-[10rem];
        @apply px-3 py-2 text-purple-100;
    }
    dialog::backdrop {
        @apply bg-gray-900/80;

    }
</style>
<dialog bind:this={dialog} on:close>
    <header class="flex justify-between items-center">
        <p>{title}</p>
        <button
        type="button"
        class="hover:bg-slate-600 p-1 rounded"
        on:click={() => dialog.close()}
    >
    <Fa icon={faClose} />
</button>
    </header>
	<slot/>
</dialog>