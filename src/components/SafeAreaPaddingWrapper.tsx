import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import type {UseBottomSafeAreaPaddingStyleParams} from '@hooks/useBottomSafeSafeAreaPaddingStyle';

type SafeAreaPaddingWrapperProps = UseBottomSafeAreaPaddingStyleParams & {
    /** Render prop that receives the computed style with bottom safe area padding applied. */
    children: (style: StyleProp<ViewStyle>) => ReactNode;
};

/**
 * Computes a bottom-safe-area-padding style via useBottomSafeSafeAreaPaddingStyle and exposes it to a render prop.
 *
 * useBottomSafeSafeAreaPaddingStyle reads ScreenWrapperOfflineIndicatorContext, which is provided *inside* ScreenWrapper.
 * Calling the hook directly in a component that itself renders ScreenWrapper would read the default context value (above
 * the provider). Rendering this wrapper as a child of ScreenWrapper keeps the hook below the provider so the offline
 * indicator safe area offset is resolved correctly, while still letting the caller decide what to render with the style.
 */
function SafeAreaPaddingWrapper({children, ...params}: SafeAreaPaddingWrapperProps) {
    const style = useBottomSafeSafeAreaPaddingStyle(params);
    return children(style);
}

SafeAreaPaddingWrapper.displayName = 'SafeAreaPaddingWrapper';

export default SafeAreaPaddingWrapper;
export type {SafeAreaPaddingWrapperProps};
