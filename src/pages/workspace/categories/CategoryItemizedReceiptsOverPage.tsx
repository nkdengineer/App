import React from 'react';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionListWithSections';
import RadioListItem from '@components/SelectionListWithSections/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToShortDisplayString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {removePolicyCategoryItemizedReceiptsRequired, setPolicyCategoryItemizedReceiptsRequired} from '@userActions/Policy/Category';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type CategoryItemizedReceiptsOverPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORY_ITEMIZED_RECEIPTS_OVER>;

function getInitiallyFocusedOptionKey(isAlwaysSelected: boolean, isNeverSelected: boolean): ValueOf<typeof CONST.POLICY.REQUIRE_ITEMIZED_RECEIPTS_OVER_OPTIONS> {
    if (isAlwaysSelected) {
        return CONST.POLICY.REQUIRE_ITEMIZED_RECEIPTS_OVER_OPTIONS.ALWAYS;
    }

    if (isNeverSelected) {
        return CONST.POLICY.REQUIRE_ITEMIZED_RECEIPTS_OVER_OPTIONS.NEVER;
    }

    return CONST.POLICY.REQUIRE_ITEMIZED_RECEIPTS_OVER_OPTIONS.DEFAULT;
}

function CategoryItemizedReceiptsOverPage({
    route: {
        params: {policyID, categoryName},
    },
}: CategoryItemizedReceiptsOverPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policy = usePolicy(policyID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, {canBeMissing: true});

    const isAlwaysSelected = policyCategories?.[categoryName]?.maxAmountNoItemizedReceipt === 0;
    const isNeverSelected = policyCategories?.[categoryName]?.maxAmountNoItemizedReceipt === CONST.DISABLED_MAX_EXPENSE_VALUE;
    const maxExpenseAmountToDisplay = policy?.maxExpenseAmountNoItemizedReceipt === CONST.DISABLED_MAX_EXPENSE_VALUE ? 0 : policy?.maxExpenseAmountNoItemizedReceipt;

    const itemizedReceiptsOverListData = [
        {
            value: null,
            text: translate(`workspace.rules.categoryRules.itemizedReceiptsOverList.default`, {
                defaultAmount: convertToShortDisplayString(maxExpenseAmountToDisplay, policy?.outputCurrency ?? CONST.CURRENCY.USD),
            }),
            keyForList: CONST.POLICY.REQUIRE_ITEMIZED_RECEIPTS_OVER_OPTIONS.DEFAULT,
            isSelected: !isAlwaysSelected && !isNeverSelected,
        },
        {
            value: CONST.DISABLED_MAX_EXPENSE_VALUE,
            text: translate(`workspace.rules.categoryRules.itemizedReceiptsOverList.never`),
            keyForList: CONST.POLICY.REQUIRE_ITEMIZED_RECEIPTS_OVER_OPTIONS.NEVER,
            isSelected: isNeverSelected,
        },
        {
            value: 0,
            text: translate(`workspace.rules.categoryRules.itemizedReceiptsOverList.always`),
            keyForList: CONST.POLICY.REQUIRE_ITEMIZED_RECEIPTS_OVER_OPTIONS.ALWAYS,
            isSelected: isAlwaysSelected,
        },
    ];

    const initiallyFocusedOptionKey = getInitiallyFocusedOptionKey(isAlwaysSelected, isNeverSelected);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID={CategoryItemizedReceiptsOverPage.displayName}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.categoryRules.itemizedReceiptsOver')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyID, categoryName))}
                />
                <SelectionList
                    sections={[{data: itemizedReceiptsOverListData}]}
                    ListItem={RadioListItem}
                    onSelectRow={(item) => {
                        if (typeof item.value === 'number') {
                            setPolicyCategoryItemizedReceiptsRequired(policyID, categoryName, item.value, policyCategories);
                        } else {
                            removePolicyCategoryItemizedReceiptsRequired(policyID, categoryName, policyCategories);
                        }
                        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.goBack(ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyID, categoryName)));
                    }}
                    shouldSingleExecuteRowSelect
                    containerStyle={[styles.pt3]}
                    initiallyFocusedOptionKey={initiallyFocusedOptionKey}
                    addBottomSafeAreaPadding
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

CategoryItemizedReceiptsOverPage.displayName = 'CategoryItemizedReceiptsOverPage';

export default CategoryItemizedReceiptsOverPage;

