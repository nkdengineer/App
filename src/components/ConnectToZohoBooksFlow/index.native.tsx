import RequireTwoFactorAuthenticationModal from '@components/RequireTwoFactorAuthenticationModal';

import useLocalize from '@hooks/useLocalize';
import useTwoFactorAuthRoute from '@hooks/useTwoFactorAuthRoute';

import {appendAccountingConnectionQuery} from '@libs/accountingConnectionQuery';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import {useEffect, useState} from 'react';

import type {ConnectToZohoBooksFlowProps} from './types';

function ConnectToZohoBooksFlow({policyID}: ConnectToZohoBooksFlowProps) {
    const {translate} = useLocalize();

    const {is2FAEnabled, getTwoFactorAuthRoute} = useTwoFactorAuthRoute();

    const [isRequire2FAModalOpen, setIsRequire2FAModalOpen] = useState(!is2FAEnabled);

    useEffect(() => {
        if (!is2FAEnabled) {
            return;
        }
        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_ZOHO_BOOKS_SETUP.getRoute(policyID));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!is2FAEnabled) {
        return (
            <RequireTwoFactorAuthenticationModal
                onSubmit={() => {
                    setIsRequire2FAModalOpen(false);
                    Navigation.navigate(appendAccountingConnectionQuery(getTwoFactorAuthRoute(), CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS));
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
