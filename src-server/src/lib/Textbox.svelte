<script lang="ts">
export let title = '';
export let position: 'left' | 'bottom' = 'left';
export let classes = '';
</script>

<div class="{position} {classes}">
    {#if title}
        <h1>{title}</h1>
    {/if}
    <slot />
</div>

<style>
h1 {
    all: unset;
    font: bold;
}
div {
    background: #ff9ae685;
    padding: 0.25rem 1rem;
    height: fit-content;
    position: relative;
    --textboxcolor: #ff9ae685;
}
.left::before {
    content: '';
    display: block;
    width: 0;
    height: 0;
    position: absolute;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-right: 8px solid var(--textboxcolor);
    left: -8px;
    top: 7px;
}
.bottom::before {
    content: '';
    display: block;
    width: 0;
    height: 0;
    position: absolute;
    border-top: 8px solid var(--textboxcolor);
    border-right: 8px solid transparent;
    border-left: 8px solid transparent;
    right: 45%;
    bottom: -8px;
}
</style>
