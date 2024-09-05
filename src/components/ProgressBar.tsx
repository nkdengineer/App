import React, {useEffect} from 'react';
import Animated, {cancelAnimation, Easing, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming} from 'react-native-reanimated';

function ProgressBar({shouldShow}: {shouldShow: boolean}) {
    const left = useSharedValue(0);
    const width = useSharedValue(0);
    const opacity = useSharedValue(0);
    const isVisible = useSharedValue(false);

    useEffect(() => {
        if (shouldShow) {
            // eslint-disable-next-line react-compiler/react-compiler
            isVisible.value = true;
            left.value = 0;
            width.value = 0;
            opacity.value = withTiming(1, {duration: 300});
            left.value = withDelay(
                300, // 0.3s delay
                withRepeat(
                    withSequence(
                        withTiming(0, {duration: 0}),
                        withTiming(0, {duration: 750, easing: Easing.bezier(0.65, 0, 0.35, 1)}),
                        withTiming(100, {duration: 750, easing: Easing.bezier(0.65, 0, 0.35, 1)}),
                    ),
                    -1,
                    false,
                ),
            );

            width.value = withDelay(
                300, // 0.3s delay
                withRepeat(
                    withSequence(
                        withTiming(0, {duration: 0}),
                        withTiming(100, {duration: 750, easing: Easing.bezier(0.65, 0, 0.35, 1)}),
                        withTiming(0, {duration: 750, easing: Easing.bezier(0.65, 0, 0.35, 1)}),
                    ),
                    -1,
                    false,
                ),
            );
        } else if (isVisible.value) {
            opacity.value = withTiming(0, {duration: 300}, () => {
                runOnJS(() => {
                    isVisible.value = false;
                    cancelAnimation(left);
                    cancelAnimation(width);
                });
            });
        }
    }, [shouldShow]);

    const animatedIndicatorStyle = useAnimatedStyle(() => {
        return {
            left: `${left.value}%`,
            width: `${width.value}%`,
        };
    });

    const animatedContainerStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });

    return isVisible.value ? (
        <Animated.View
            style={[
                {
                    height: 2,
                    width: '100%',
                    backgroundColor: '#1A3D32',
                    borderRadius: 5,
                    overflow: 'hidden',
                },
                animatedContainerStyle,
            ]}
        >
            <Animated.View style={[{height: '100%', backgroundColor: '#03D47C', borderRadius: 5, width: '100%'}, animatedIndicatorStyle]} />
        </Animated.View>
    ) : null;
}

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
