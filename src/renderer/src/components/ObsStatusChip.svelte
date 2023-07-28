<script>
import { state } from '../store';
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
    ready: [faCircleCheck, 'frogs are online! ', 'bg-emerald-600/50']
};
$: connectionText = connection[$state][1];
</script>

<div
    class={`py-1 px-2 rounded-full flex gap-x-2 items-center h-fit  ${connection[$state][2]} w-fit `}
>
    <Fa icon={connection[$state][0]} size="sm" spin={$state === 'init'} />
    <p class="text-xs">
        <span class="text-white/75 bold">status:</span>
        {connectionText}
    </p>
</div>
