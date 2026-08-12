import type {AnimatedTextInputRef} from '@components/RNTextInput';

import useAutoFocusInput from '@hooks/useAutoFocusInput';

import {useEffect} from 'react';

import type {AutoFocusConnector} from './types';

type AutoFocusFirstInputProps = {
    /** Publishes the ref callback starting the auto-focus flow, so that the form can call it when its first input mounts */
    setInputCallbackRef: (inputCallbackRef: AutoFocusConnector['inputCallbackRef']) => void;

    /** Returns the first focusable input of the form once it has mounted */
    getFocusableInput: () => AnimatedTextInputRef | null;
};

/**
 * Focuses the first input of a form once the screen transition ends. It renders nothing and only exists as a separate
 * component so that forms which don't auto-focus don't subscribe to the modal, splash screen and side panel state that
 * `useAutoFocusInput` watches to know when focusing is safe.
 */
function AutoFocusFirstInput({setInputCallbackRef, getFocusableInput}: AutoFocusFirstInputProps) {
    const {inputCallbackRef} = useAutoFocusInput();

    useEffect(() => {
        setInputCallbackRef(inputCallbackRef);

        // Inputs mount before this effect runs, so an input that is already there has to be handed over here instead.
        const focusableInput = getFocusableInput();
        if (focusableInput) {
            inputCallbackRef(focusableInput);
        }

        return () => {
            setInputCallbackRef(null);
        };
    }, [setInputCallbackRef, getFocusableInput, inputCallbackRef]);

    return null;
}

export default AutoFocusFirstInput;
