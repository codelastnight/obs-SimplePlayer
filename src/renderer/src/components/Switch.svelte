<script lang="ts">
export let checked = false;
export let flipLabel = false;
export let spaceBetween = false;
export let title = '';
</script>

<label
    class="flex items-center cursor-pointer relative gap-2 py-1 hover:bg-slate-400/20 rounded-full {flipLabel
        ? 'pl-3 pr-1 '
        : 'pr-3 pl-1'} "
    class:flex-row-reverse={flipLabel}
    class:spaceOut={spaceBetween}
    {title}
>
    <input
        bind:checked
        on:change
        class="sr-only"
        role="switch"
        type="checkbox"
    />
    <div
        class="toggle-bg relative bg-slate-600 border border-slate-500 h-6 w-11 rounded-full"
    />
    <slot />
</label>

<style lang="postcss">
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
.spaceOut {
    @apply w-full justify-between;
}
</style>
