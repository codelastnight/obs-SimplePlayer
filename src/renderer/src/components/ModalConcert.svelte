<script context="module" lang="ts">
import { closeModal, openModal } from 'svelte-modals';
import { concertMode } from '../store';
import ModalConcert from './ModalConcert.svelte';

let mode = false;
concertMode.subscribe((a) => {
    mode = a;
});

export function handleConfirm(action = 'confirm', onConfirm: () => void) {
    if (!mode) {
        onConfirm();
        return;
    }
    openModal(ModalConcert, {
        message: action,
        onConfirm: () => {
            onConfirm();
            closeModal();
        }
    });
}
</script>

<script>
import Fa from 'svelte-fa';
import { faWarning } from '@fortawesome/free-solid-svg-icons';
import { fly } from 'svelte/transition';
// provided by <Modals />
export let isOpen;

export let message;
export let onConfirm;
export let label = { confirm: message };
</script>

{#if isOpen}
    <div
        role="dialog"
        class="modal"
        transition:fly|global={{ y: 15, duration: 150 }}
        on:introstart
        on:outroend
    >
        <div class="contents text-center">
            <h2 class="text-2xl max-w-xs mt-3 mb-3 mx-12">
                Are you sure you
                <br />
                want to press {message}?
            </h2>

            <div class="flex justify-between gap-3 mb-3 mt-1 px-3">
                <button class=" px-4 py-1 hover:underline" on:click={closeModal}
                    >cancel</button
                >
                <button
                    class="px-4 py-1 font-bold bg-gray-800/50 hover:bg-gray-800 rounded-full"
                    on:click={onConfirm}>{label.confirm}</button
                >
            </div>
            <div class="tip">
                <Fa class="mt-0.5" icon={faWarning} />
                <div class="text-left">
                    <p>Concert Mode: All actions will take an extra click</p>
                </div>
            </div>
        </div>
    </div>
{/if}

<style lang="postcss">
.tip {
    @apply grid gap-1 bg-purple-950;
    @apply rounded-b-lg px-2 py-1 text-xs text-yellow-300/80;
    grid-template-columns: 16px auto;
}
.modal {
    @apply fixed inset-0 flex items-center justify-center;

    /* allow click-through to backdrop */
    pointer-events: none;
}

.contents {
    @apply flex flex-col justify-between  bg-purple-900;
    @apply min-w-[240px] rounded-xl;

    pointer-events: auto;
}
</style>
