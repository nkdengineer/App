import {getZohoBooksSetupLink} from '@libs/actions/connections/ZohoBooks';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AccountingSetupWebViewPage from '@pages/workspace/accounting/AccountingSetupWebViewPage';

import type SCREENS from '@src/SCREENS';

import React from 'react';

type ZohoBooksSetupPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.ZOHO_BOOKS_SETUP>;

function ZohoBooksSetupPage({route}: ZohoBooksSetupPageProps) {
    const policyID = route.params.policyID;

    return (
        <AccountingSetupWebViewPage
            uri={getZohoBooksSetupLink(policyID)}
            testID="ZohoBooksSetupPage"
            shouldAppendShortLivedAuthToken
        />
    );
}

export default ZohoBooksSetupPage;
