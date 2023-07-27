<script>
import Fa from 'svelte-fa';
import { faClose, faMinus } from '@fortawesome/free-solid-svg-icons';
import Dialog from './Dialog.svelte';
import Marquee from 'svelte-fast-marquee';
import {onMount} from 'svelte'
import ObsStatusChip from './ObsStatusChip.svelte';
 let aboutData


onMount(()=>{
    async function getAboutData(){
        aboutData = await window.api.getAboutData();
        console.log(aboutData)
    }
    getAboutData()
})

let dialog
</script>

<style lang="postcss">
header {
    -webkit-app-region: drag;
    @apply w-full px-1 py-0.5 flex justify-between items-center;
    
}
button {
    @apply px-2 py-1 rounded ;
    -webkit-app-region: no-drag;
}

</style>

<header>
    <div class="flex-1 text-xs flex gap-2 items-center" >
        <button
            type="button"
            class="hover:bg-neutral-900"
            on:click={() => dialog.showModal()}
        >
           <p>about</p>
        </button>
        <p class="text-white/75">v{aboutData?.version || ''}</p>

    </div>

    <div class="flex items-center gap-1">
        <p class="px-3 py-1 text-white/80">the frogfest app :3</p>        

    </div>
 

    <div class="flex h-full flex-1 justify-end gap-1 items-center">
        <ObsStatusChip />

        <button
            type="button"
            class="hover:bg-neutral-800 ml-3"
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
<Dialog bind:dialog fun >
    <div class="flex flex-col items-center h-[50vh] w-[50vw] justify-between">
     
    <div class="flex flex-col items-center">
        <img src="logo.jpg" alt="frog logo" width="100rem" />
        <h1 class="font-bold text-2xl mb-3">
            Frog Player :3        
            <span class="text-white/75 font-normal text-xl">
                v{aboutData?.version || ''}
            </span>
        </h1>
        <p>i love frogs!!!!</p>
    </div>
        
    <div class="flex flex-col items-center w-full">
        <p class="mb-1 ">made with 🐸 by <a href="https://artsandcrafts.work" target="_blank" class="underline text-blue-500">arts + crafts</a></p>
        <Marquee pauseOnClick={true} direction='right' play={true} speed={20}>
            <h1 class="px-4">FROG IS LIFE</h1>
            <h2 class="px-4">AMPHIBIAN ETERNAL BLISS</h2>
            <h1 class="px-4">FROG</h1>
            <h1 class="px-4">[BLESSED LIFE]</h1>
        </Marquee>
    </div>
       
    </div>
</Dialog>
