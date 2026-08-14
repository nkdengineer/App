import useDebounce from '@hooks/useDebounce';

import CONST from '@src/CONST';

import type {RefObject} from 'react';

import {useRef} from 'react';

type UseDebouncedSaveDraftResult = {
    saveDraft: (...args: unknown[]) => void;
    cancelPendingSave: () => void;
    isSavePending: RefObject<boolean>;
};

/**
 * Non-generic implementation so OXC's React Compiler can memoize the hook.
 * OXC bails on type params inside hooks ("Unsupported declaration type for hoisting").
 */
function useDebouncedSaveDraftImpl(saveDraftFn: (...args: unknown[]) => void, wait = CONST.TIMING.DRAFT_SAVE_DEBOUNCE_TIME, shouldExecuteOnUnmount = false): UseDebouncedSaveDraftResult {
    const isSavePending = useRef(false);

    const debouncedSaveDraft = useDebounce(
        (...args: unknown[]) => {
            saveDraftFn(...args);
            isSavePending.current = false;
        },
        wait,
        {shouldExecuteOnUnmount},
    );

    const saveDraft = (...args: unknown[]) => {
        isSavePending.current = true;
        debouncedSaveDraft(...args);
    };

    const cancelPendingSave = () => {
        debouncedSaveDraft.cancel();
        isSavePending.current = false;
    };

    return {
        saveDraft,
        cancelPendingSave,
        isSavePending,
    };
}

/**
 * Debounces a function to save a draft for a report comment or report action draft.
 * @param saveDraft - The function to save the draft. It will be called with the arguments passed to the triggerSaveDraft function.
 * @param wait - The number of milliseconds to delay.
 * @param shouldExecuteOnUnmount - Whether to execute the save draft function on unmount.
 * @returns An object containing the debounced save draft function, the canceller for a pending save, and the is save pending ref.
 * @property {Function} saveDraft - The debounced save draft function.
 * @property {Function} cancelPendingSave - Discards a pending save so it can never land after the draft has been cleared.
 * @property {Ref<boolean>} isSavePending - The ref to check whether the save is pending.
 */
function useDebouncedSaveDraft<SaveDraftArgs extends unknown[]>(saveDraftFn: (...args: SaveDraftArgs) => void, wait = CONST.TIMING.DRAFT_SAVE_DEBOUNCE_TIME, shouldExecuteOnUnmount = false) {
    return useDebouncedSaveDraftImpl(saveDraftFn as (...args: unknown[]) => void, wait, shouldExecuteOnUnmount) as {
        saveDraft: (...args: SaveDraftArgs) => void;
        cancelPendingSave: () => void;
        isSavePending: RefObject<boolean>;
    };
}

export default useDebouncedSaveDraft;
