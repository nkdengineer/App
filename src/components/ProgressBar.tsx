import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';

type ProgressBarProps = {
    shouldShow: boolean;
};

function ProgressBar({shouldShow}: ProgressBarProps) {
    const [isProgressing, setIsProgressing] = useState(false);
    const progressValue = useSharedValue(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!shouldShow) {
            return;
        }

        setIsProgressing(true);
        setProgress(0);
    }, [shouldShow, setIsProgressing, setProgress]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (shouldShow) {
            setProgress(0);
            // eslint-disable-next-line react-compiler/react-compiler
            progressValue.value = 0;
            interval = setInterval(() => {
                setProgress((prev) => {
                    const nextProgress = prev + 10;
                    if (nextProgress >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return nextProgress;
                });
            }, 300);
        } else if (progress < 100) {
            progressValue.value = withTiming(100, {duration: 1000, easing: Easing.linear}, () => {
                setIsProgressing(false);
            });
            setProgress(100);
        }

        return () => {
            if (!interval) {
                return;
            }
            clearInterval(interval);
        };
    }, [shouldShow]);

    useEffect(() => {
        // eslint-disable-next-line react-compiler/react-compiler
        progressValue.value = withTiming(progress, {duration: 300});
    }, [progress, progressValue]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: `${progressValue.value}%`,
        };
    });

    if (!shouldShow && !isProgressing) {
        return null;
    }

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
            <Animated.View style={[{height: '100%', backgroundColor: '#03D47C', borderRadius: 5}, animatedStyle]} />
        </View>
    );
}

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
