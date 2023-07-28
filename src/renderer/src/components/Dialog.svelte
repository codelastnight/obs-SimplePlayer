<script lang="ts">
import Fa from 'svelte-fa';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { createEventDispatcher } from 'svelte';
export let dialog;
export let title = '';
export let fun = false;

export let isOpen = false;

const dispatch = createEventDispatcher();
$: if (isOpen) {
    dialog?.showModal();
} else {
    dialog?.close();
}

function onClose() {
    dispatch('close');
    isOpen = false;
}
</script>

<dialog bind:this={dialog} on:close={onClose} class={`${fun ? 'fun' : ''}`}>
    <header class="flex justify-between items-center">
        <p>{title}</p>
        <button
            type="button"
            class="hover:bg-slate-600 p-2 rounded-xl"
            on:click={() => dialog.close()}
        >
            <Fa icon={faClose} />
        </button>
    </header>
    <slot />
</dialog>

<style lang="postcss">
dialog {
    @apply min-w-[10rem] rounded-xl border border-stone-900 bg-slate-900;
    @apply px-3 py-2 text-purple-100;
}
dialog::backdrop {
    @apply bg-stone-900/80;
}
.fun {
    background-image: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.6),
            rgba(0, 0, 0, 1)
        ),
        url('/Untitled.jpg');
    background-size: 180px 200px;
    background-repeat: repeat;
}
</style>
