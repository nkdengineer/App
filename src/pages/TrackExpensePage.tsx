import FullScreenLoadingIndicator from "@components/FullscreenLoadingIndicator";
import Navigation from "@libs/Navigation/Navigation";
import { useFocusEffect } from "@react-navigation/native";
import CONST from "@src/CONST";
import ONYXKEYS from "@src/ONYXKEYS";
import React from "react";
import { useOnyx } from "react-native-onyx";
import * as App from '@userActions/App';
import * as ReportUtils from '@libs/ReportUtils';
import * as IOU from '@userActions/IOU';

function TrackExpensePage() {
    const [session] = useOnyx(ONYXKEYS.SESSION);

    useFocusEffect(() => {
        if (session && 'authToken' in session) {
            App.confirmReadyToOpenApp();
            Navigation.isNavigationReady().then(() => {
                Navigation.goBack();
                IOU.startMoneyRequest(CONST.IOU.TYPE.TRACK, ReportUtils.findSelfDMReportID() ?? '-1')
            });
        } else {
            Navigation.navigate();
        }
    });

    return (
        <FullScreenLoadingIndicator />
    );
}

TrackExpensePage.displayName = 'TrackExpensePage';

export default TrackExpensePage;