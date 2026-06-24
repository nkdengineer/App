import React from 'react';
import OfflineIndicator from '@components/OfflineIndicator';
import useThemeStyles from '@hooks/useThemeStyles';
import ComposerExceededLength from './ComposerExceededLength';
import ComposerFooter from './ComposerFooter';
import ComposerTypingIndicator from './ComposerTypingIndicator';

function ComposerDefaultFooter({shouldShowOfflineIndicator}: {shouldShowOfflineIndicator: boolean}) {
    const styles = useThemeStyles();

    return (
        <ComposerFooter>
            {shouldShowOfflineIndicator && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}
            <ComposerTypingIndicator />
            <ComposerExceededLength />
        </ComposerFooter>
    );
}

export default ComposerDefaultFooter;
