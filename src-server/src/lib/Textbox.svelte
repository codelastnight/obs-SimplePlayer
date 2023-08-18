<script lang="ts">
export let title = '';
export let position: 'left' | 'bottom' = 'left';
export let bounce = true;
export let classes = '';
</script>

<div class:bob={bounce}>
    <div class="box {position} {classes}">
        {#if title}
            <h1>{title}</h1>
        {/if}
        <slot />
    </div>
</div>

<style>
h1 {
    all: unset;
    font: bold;
}
.box {
    --textboxcolor: linear-gradient(
            180deg,
            #ffe5e8 0%,
            rgba(255, 229, 232, 0) 100%
        ),
        #ffc7d8;
    background: var(--textboxcolor);
    padding: 0.25rem 1rem;
    height: fit-content;
    position: relative;
    border: 2px double #f93a2b;
    border-radius: 8px;
    transform-style: preserve-3d;

    transform: skewX(-20deg) rotateY(10deg);
    max-width: 50ch;
}
/* .left::before {
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
} */

@keyframes bob {
    from {
        transform: translateY(-6px);
    }
    to {
        transform: translateY(0px);
    }
}
.bob {
    animation-name: bob;
    animation-duration: 1s;
    animation-direction: alternate;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
}
</style>
