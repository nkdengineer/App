import React from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Navigation from '@libs/Navigation/Navigation';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateMemberCustomField} from '@libs/actions/Policy/Member';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/MemberCustomField';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import ROUTES from '@src/ROUTES';
import useAutoFocusInput from '@hooks/useAutoFocusInput';

type MemberCustomFieldPageProps = Omit<WithPolicyAndFullscreenLoadingProps, 'route'> & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBER_CUSTOM_FIELD>;

function MemberCustomFieldPage({route, policy, personalDetails}: MemberCustomFieldPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput();

    const {policyID, fieldID} = route.params;

    const accountID = Number(route.params.accountID);
    const memberLogin = personalDetails?.[accountID]?.login ?? '';
    const member = policy?.employeeList?.[memberLogin];

    return (
        <ScreenWrapper testID={SCREENS.WORKSPACE.MEMBER_CUSTOM_FIELD}>
            <HeaderWithBackButton
                title={translate(`workspace.common.${fieldID}`)}
                shouldShowBackButton
            />

            <Text style={[styles.mh5, styles.mv4]}>Add custom coding that applies to all spend from this member</Text>
            <FormProvider
                formID={ONYXKEYS.FORMS.WORKSPACE_MEMBER_CUSTOM_FIELD_FORM}
                onSubmit={(values) => {
                    if (values[INPUT_IDS.CUSTOM_FIELD] === member?.[fieldID]) {
                        Navigation.goBack(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
                        return;
                    }
                    updateMemberCustomField(policyID, accountID, fieldID, values[INPUT_IDS.CUSTOM_FIELD]);
                    Navigation.goBack(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
                }}
                validate={() => {
                    return {};
                }}
                enabledWhenOffline
                submitButtonText={translate('common.save')}
                style={[styles.flex1, styles.mh5]}
            >
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.CUSTOM_FIELD}
                    label={translate(`workspace.common.${fieldID}`)}
                    defaultValue={member?.[fieldID]}
                    ref={inputCallbackRef}
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

MemberCustomFieldPage.displayName = 'MemberCustomFieldPage';

export default withPolicyAndFullscreenLoading(MemberCustomFieldPage);
