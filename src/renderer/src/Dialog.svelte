<script>
    import Fa from 'svelte-fa';
    import { faClose } from '@fortawesome/free-solid-svg-icons';


	export let dialog
    export let title = ''
    export let fun = false;
    
    //export let isOpen
</script>
<style lang="postcss">
    dialog {
        @apply bg-slate-900 border border-gray-700 min-w-[10rem] rounded-xl;
        @apply px-3 py-2 text-purple-100;
    }
    dialog::backdrop {
        @apply bg-stone-900/80;

    }
    .fun {
        background-image:  linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.5),
    rgba(0, 0, 0, 0.5)
  ), url('/Untitled.jpg')  ;
    background-size: 180px 200px;
    background-repeat: repeat;
    }
</style>
<dialog bind:this={dialog} on:close class={`${fun ? 'fun' : '' }`} >
    <header class="flex justify-between items-center ">
        <p>{title}</p>
        <button
        type="button"
        class="hover:bg-slate-600 p-2 rounded-xl"
        on:click={() => dialog.close()}
    >
    <Fa icon={faClose} />
</button>
    </header>
	<slot/>
</dialog>