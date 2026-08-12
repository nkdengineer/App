import {canUseTouchScreen} from '@libs/DeviceCapabilities';

import type CanAutoFocusFirstInput from './types';

/**
 * Focusing the first input of a form on mount is a convenience for users typing on a physical keyboard. On a touch
 * screen it opens the software keyboard right away, which covers the form, so the input is left unfocused there.
 */
const canAutoFocusFirstInput: CanAutoFocusFirstInput = () => !canUseTouchScreen();

export default canAutoFocusFirstInput;
