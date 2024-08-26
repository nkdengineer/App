import React, {useEffect} from 'react';
import {View} from 'react-native';
import Animated, {cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming} from 'react-native-reanimated';

function ProgressBar({shouldShow}: {shouldShow: boolean}) {
    const left = useSharedValue(0);
    const width = useSharedValue(0);

    useEffect(() => {
        if (shouldShow) {
            // eslint-disable-next-line react-compiler/react-compiler
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
        } else {
            cancelAnimation(left);
            cancelAnimation(width);
            left.value = 0;
            width.value = 0;
        }
    }, [shouldShow]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            left: `${left.value}%`,
            width: `${width.value}%`,
        };
    });

    return (
        <View
            style={{
                height: 2,
                width: '100%',
                backgroundColor: '#1A3D32',
                borderRadius: 5,
                overflow: 'hidden',
            }}
        >
            <Animated.View style={[{height: '100%', backgroundColor: shouldShow ? '#03D47C' : 'transparent', borderRadius: 5, width: '100%'}, animatedStyle]} />
        </View>
    );
}

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
