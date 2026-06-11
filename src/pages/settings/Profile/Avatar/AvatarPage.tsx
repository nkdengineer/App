import React from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {resolveAvatarURI} from '@libs/Avatars/PresetAvatarCatalog';
import Navigation from '@libs/Navigation/Navigation';
import type {OnSaveParams} from '@pages/settings/Agents/Fields/EditAgentAvatarPage';
import {EditAgentAvatarContent} from '@pages/settings/Agents/Fields/EditAgentAvatarPage';
import {updateAvatar} from '@userActions/PersonalDetails';
import EditUserAvatarContent from './EditUserAvatarContent';

function ProfileAvatar() {
    const isAgentAccount = true;

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    if (isAgentAccount) {
        const handleAgentSave = (params: OnSaveParams) => {
            if ('file' in params) {
                updateAvatar(params.file, {
                    avatar: currentUserPersonalDetails?.avatar,
                    avatarThumbnail: currentUserPersonalDetails?.avatarThumbnail,
                    accountID: currentUserPersonalDetails?.accountID,
                });
            } else {
                const {customExpensifyAvatarID} = params;
                const uri = resolveAvatarURI(customExpensifyAvatarID);
                updateAvatar(
                    {
                        uri,
                        name: customExpensifyAvatarID,
                        customExpensifyAvatarID,
                    },
                    {
                        avatar: currentUserPersonalDetails?.avatar,
                        avatarThumbnail: currentUserPersonalDetails?.avatarThumbnail,
                        accountID: currentUserPersonalDetails?.accountID,
                    },
                );
            }
            Navigation.dismissModal();
        };
        return (
            <EditAgentAvatarContent
                accountID={currentUserPersonalDetails.accountID}
                onSave={handleAgentSave}
            />
        );
    }

    return <EditUserAvatarContent />;
}

export default ProfileAvatar;
