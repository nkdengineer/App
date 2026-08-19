import ProductMarketingWindowManager from '@components/ProductMarketingWindow/ProductMarketingWindowManager';
import SidePanel from '@components/SidePanel';

import type {ExtraContentProps} from '@libs/Navigation/PlatformStackNavigation/types';

import React from 'react';

// On mobile platforms, concierge is displayed as a separate page and the tab bar is rendered by the TabNavigator,
// so the only extra content is the product marketing window, which is rendered outside of the changing route
// screens so it stays mounted while the user navigates.
function RootNavigatorExtraContent({navigation, state}: ExtraContentProps) {
    return (
        <>
            <SidePanel navigation={navigation} />
            <ProductMarketingWindowManager topmostRouteName={state.routes.at(-1)?.name} />
        </>
    );
}

export default RootNavigatorExtraContent;
