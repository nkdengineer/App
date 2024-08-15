import React, {useEffect} from 'react';
import {View} from 'react-native';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming} from 'react-native-reanimated';

function ProgressBar() {
    const left = useSharedValue(0);
    const width = useSharedValue(0);

    useEffect(() => {
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
    }, []);

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
            <Animated.View style={[{height: '100%', backgroundColor: '#03D47C', borderRadius: 5, width: '100%'}, animatedStyle]} />
        </View>
    );
}

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
