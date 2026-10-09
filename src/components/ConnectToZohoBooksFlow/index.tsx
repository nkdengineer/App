import RequireTwoFactorAuthenticationModal from '@components/RequireTwoFactorAuthenticationModal';

import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useTwoFactorAuthRoute from '@hooks/useTwoFactorAuthRoute';

import {appendAccountingConnectionQuery} from '@libs/accountingConnectionQuery';
import {getZohoBooksSetupLink} from '@libs/actions/connections/ZohoBooks';
import {close} from '@libs/actions/Modal';
import Navigation from '@libs/Navigation/Navigation';

import {openLink} from '@userActions/Link';

import CONST from '@src/CONST';

import React, {useEffect, useState} from 'react';

import type {ConnectToZohoBooksFlowProps} from './types';

function ConnectToZohoBooksFlow({policyID}: ConnectToZohoBooksFlowProps) {
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();

    const {is2FAEnabled, getTwoFactorAuthRoute} = useTwoFactorAuthRoute();

    const [isRequire2FAModalOpen, setIsRequire2FAModalOpen] = useState(!is2FAEnabled);

    useEffect(() => {
        if (!is2FAEnabled) {
            return;
        }
        // On web the setup opens OldDot in a new browser tab. Open it inline here (within the connect click's
        // user-gesture window) instead of navigating to a setup screen, otherwise the popup blocker stops the tab.
        openLink(getZohoBooksSetupLink(policyID), environmentURL);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!is2FAEnabled) {
        return (
            <RequireTwoFactorAuthenticationModal
                onSubmit={() => {
                    setIsRequire2FAModalOpen(false);
                    close(() => {
                        Navigation.navigate(appendAccountingConnectionQuery(getTwoFactorAuthRoute(), CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS));
                    });
                }}
                onCancel={() => {
                    setIsRequire2FAModalOpen(false);
                }}
                isVisible={isRequire2FAModalOpen}
                description={translate('twoFactorAuth.twoFactorAuthIsRequiredDescription')}
            />
        );
    }

    return null;
}

export default ConnectToZohoBooksFlow;
