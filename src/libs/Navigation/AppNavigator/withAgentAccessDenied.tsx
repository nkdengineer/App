import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';

import useIsAgentAccount from '@hooks/useIsAgentAccount';

import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import {StackActions, useFocusEffect, useIsFocused, useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect} from 'react';

function withAgentAccessDenied(getComponent: () => React.ComponentType): () => React.ComponentType {
    let ProtectedComponent: React.ComponentType | undefined;
    return () => {
        if (!ProtectedComponent) {
            const Component = getComponent();
            ProtectedComponent = (props) => {
                const isAgent = useIsAgentAccount();
                const isFocused = useIsFocused();
                const navigation = useNavigation();
                const isAlreadyOnRedirectTarget = Navigation.isActiveRoute(ROUTES.SETTINGS_PROFILE.route);
                const shouldRedirect = isAgent === true && !isAlreadyOnRedirectTarget;

                const redirectAgentAway = useCallback(() => {
                    if (isAgent !== true) {
                        return;
                    }

                    // On a cold deep-link the effect can run before the NavigationContainer is ready, so the
                    // redirect is silently dropped and leaves a blank central pane. Wait for readiness before
                    // reading navigation state or dispatching.
                    Navigation.isNavigationReady().then(() => {
                        if (Navigation.isActiveRoute(ROUTES.SETTINGS_PROFILE.route)) {
                            return;
                        }

                        if (isFocused) {
                            // User navigated back onto this guarded screen — replace it with Profile so back
                            // reaches Account instead of re-focusing Agents and looping.
                            Navigation.navigate(ROUTES.SETTINGS_PROFILE.getRoute(), {forceReplace: true});
                            return;
                        }

                        // Mounted but not focused (e.g. Agents sitting behind an RHP when copiloting). Pop
                        // this screen off the stack so it cannot trap back navigation later.
                        navigation.dispatch(StackActions.pop());
                    });
                }, [isAgent, isFocused, navigation]);

                // Redirect on every focus (not just the initial transition from false to true) so navigating back
                // onto a guarded screen that the split navigator keeps mounted (e.g. a stale agents route
                // left over from the owner session) bounces the agent to a page they can access instead of
                // rendering a blank pane.
                useFocusEffect(redirectAgentAway);

                // useFocusEffect only fires while this screen is focused. When the session flips to an agent while
                // this guarded screen is mounted but NOT focused, for example the owner taps "Copilot into account" from
                // an unguarded RHP (the agent DM) sitting over this guarded central pane, useFocusEffect never runs,
                // so the pane renders null (blank background) until the RHP is closed. Drive the redirect off the
                // isAgent transition here too so the background is corrected immediately. Skip when focused since
                // useFocusEffect already covers that case.
                useEffect(() => {
                    if (isFocused) {
                        return;
                    }
                    redirectAgentAway();
                }, [isFocused, redirectAgentAway]);

                if (isAgent === undefined || shouldRedirect) {
                    return null;
                }
                if (isAgent === true) {
                    return (
                        <FullPageNotFoundView
                            shouldShow
                            titleKey="delegate.notAllowed"
                            subtitleKey="delegate.noAccessMessage"
                            shouldShowLink={false}
                        />
                    );
                }
                return <Component {...props} />;
            };
        }
        return ProtectedComponent;
    };
}

export default withAgentAccessDenied;
