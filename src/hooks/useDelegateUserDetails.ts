import {useOnyx} from 'react-native-onyx';
import AccountUtils from '@libs/AccountUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import { useMemo } from 'react';

function useDelegateUserDetails() {
    const currentUserDetails = useCurrentUserPersonalDetails();
    const [currentUserAccountDetails] = useOnyx(ONYXKEYS.ACCOUNT);
    const isDelegateAccessRestricted = useMemo(() => AccountUtils.isDelegateOnlySubmitter(currentUserAccountDetails), [currentUserAccountDetails]);
    const delegatorEmail = currentUserDetails?.login;

    return {
        isDelegateAccessRestricted,
        delegatorEmail,
    };
}

export default useDelegateUserDetails;
