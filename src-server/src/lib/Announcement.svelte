<script>
import Marquee from 'svelte-fast-marquee';
import { fly } from 'svelte/transition';
export let announcements = [];

$: textlength = announcements.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    ''
).length;
</script>

{#if announcements.length > 0}
    <section transition:fly={{ y: -20 }}>
        <Marquee speed={15}>
            {#each announcements as text, index (index)}
                <p><b>{text}</b></p>
            {/each}

            {#if textlength < 200}
                {#each announcements as text, index (index)}
                    <p><b>{text}</b></p>
                {/each}
            {/if}
            {#if textlength < 100}
                {#each announcements as text, index (index)}
                    <p><b>{text}</b></p>
                {/each}
            {/if}
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
