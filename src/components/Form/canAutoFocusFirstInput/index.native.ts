import type CanAutoFocusFirstInput from './types';

/** Forms never focus their first input on native, where it would open the software keyboard on top of the form. */
const canAutoFocusFirstInput: CanAutoFocusFirstInput = () => false;

export default canAutoFocusFirstInput;
