<script>
import Marquee from 'svelte-fast-marquee';
import { fly } from 'svelte/transition';
export let announcements = [];
</script>

{#if announcements.length > 0}
    <section transition:fly={{ y: -20 }}>
        <Marquee speed={15}>
            s {#each announcements as text, index (index)}
                <p><b>{text}</b></p>
            {/each}
        </Marquee>
    </section>
{/if}

<style>
section {
    width: 100%;
    background: #fed750;
    color: #322ef3;
    padding: 0.25rem 1rem;
}

section p {
    font-weight: bold;
    margin: 0 2rem;
}
</style>
