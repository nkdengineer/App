import React, {useEffect} from 'react';
import {View} from 'react-native';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming} from 'react-native-reanimated';

function ProgressBar() {
    const left = useSharedValue(0);
    const width = useSharedValue(0);

    useEffect(() => {
        // eslint-disable-next-line react-compiler/react-compiler
        left.value = withRepeat(
            withSequence(withTiming(0, {duration: 0}), withTiming(0, {duration: 1000, easing: Easing.linear}), withTiming(100, {duration: 1000, easing: Easing.linear})),
            -1,
            false,
        );
        width.value = withRepeat(
            withSequence(withTiming(0, {duration: 0}), withTiming(100, {duration: 1000, easing: Easing.linear}), withTiming(0, {duration: 1000, easing: Easing.linear})),
            -1,
            false,
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
