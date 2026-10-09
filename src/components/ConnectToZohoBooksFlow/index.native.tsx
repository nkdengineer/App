import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import {useEffect} from 'react';

import type {ConnectToZohoBooksFlowProps} from './types';

function ConnectToZohoBooksFlow({policyID}: ConnectToZohoBooksFlowProps) {
    useEffect(() => {
        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_ZOHO_BOOKS_SETUP.getRoute(policyID));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default ConnectToZohoBooksFlow;
