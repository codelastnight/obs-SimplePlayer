<script>
export let state;
import {
    faCircleNotch,
    faCircleDot,
    faCircleExclamation,
    faCircleCheck
} from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';

const connection = {
    init: [faCircleNotch, 'loading...', 'bg-slate-800'],

    loading: [faCircleDot, 'loading...', 'bg-slate-600'],
    disconnect: [
        faCircleExclamation,
        'ur disconnected :( restart app?',
        'bg-yellow-600'
    ],
    ready: [faCircleCheck, 'ready 2 play ', 'bg-emerald-600']
};
$: connectionText = connection[state][1];
</script>

<div
    class={`py-2 px-4 rounded-full flex gap-x-2 items-center ${connection[state][2]} w-fit `}
>
    <Fa icon={connection[state][0]} spin={state === 'init'} />
    <p>{connectionText}</p>
</div>
