import useDynamicBackPath from '@hooks/useDynamicBackPath';

import {appendAccountingConnectionQuery, getAccountingConnectionFromParams} from '@libs/accountingConnectionQuery';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';

import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';

import {DYNAMIC_ROUTES} from '@src/ROUTES';

import {useRoute} from '@react-navigation/native';
import React from 'react';

function DynamicTwoFactorAuthVerifyAccountPage() {
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.TWO_FACTOR_AUTH_VERIFY_ACCOUNT.path);
    const route = useRoute();
    // Back paths drop suffix query params, so put the connector back before opening the next 2FA step.
    const backPathWithConnection = appendAccountingConnectionQuery(backPath, getAccountingConnectionFromParams(route.params));

    return (
        <VerifyAccountPageBase
            navigateBackTo={backPath}
            navigateForwardTo={createDynamicRoute(DYNAMIC_ROUTES.TWO_FACTOR_AUTH_ROOT.path, backPathWithConnection)}
        />
    );
}

export default DynamicTwoFactorAuthVerifyAccountPage;
