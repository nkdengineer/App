/**
 * Narrow Onyx collection selectors for SplitExpensePage so the screen only re-renders when
 * data relevant to the open split changes, instead of on every update to the full collections.
 */
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {isPolicyExpenseChat, isSelfDM, isThread} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyTagLists, Report, ReportActions, ReportNameValuePairs, SearchResults, Transaction} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

type SplitRelatedTransactionsSelectorParams = {
    /** Route / draft transaction being split */
    transactionID: string | undefined;

    /** Original transaction ID from the draft comment, when present */
    originalTransactionID: string | undefined;

    /** Transaction IDs already listed on the draft split expenses */
    splitTransactionIDs: string[];

    /** Expense report ID — needed so "last transaction in report" save logic still sees siblings */
    expenseReportID: string | undefined;
};

function isTransactionCollectionKey(key: string): key is `${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}` {
    return key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION);
}

/**
 * Keeps the original/split child transactions plus any siblings on the expense report.
 */
function createSplitRelatedTransactionsSelector({transactionID, originalTransactionID, splitTransactionIDs, expenseReportID}: SplitRelatedTransactionsSelectorParams) {
    const splitTransactionIDSet = new Set(splitTransactionIDs.filter(Boolean));

    return (transactions: OnyxCollection<Transaction>): OnyxCollection<Transaction> => {
        if (!transactions) {
            return {};
        }

        const result: NonNullable<OnyxCollection<Transaction>> = {};
        for (const [key, transaction] of Object.entries(transactions)) {
            if (!transaction || !isTransactionCollectionKey(key)) {
                continue;
            }

            const isRouteTransaction = !!transactionID && transaction.transactionID === transactionID;
            const isOriginalTransaction = !!originalTransactionID && transaction.transactionID === originalTransactionID;
            const isDraftSplitTransaction = !!transaction.transactionID && splitTransactionIDSet.has(transaction.transactionID);
            const isSplitChild =
                (!!transactionID && transaction.comment?.originalTransactionID === transactionID) ||
                (!!originalTransactionID && transaction.comment?.originalTransactionID === originalTransactionID);
            const isExpenseReportSibling = !!expenseReportID && transaction.reportID === expenseReportID;

            if (isRouteTransaction || isOriginalTransaction || isDraftSplitTransaction || isSplitChild || isExpenseReportSibling) {
                result[key] = transaction;
            }
        }
        return result;
    };
}

type ReportsForSplitExpenseSelectorParams = {
    reportIDs: string[];
    policyIDs: string[];
    policyExpenseChatOwnerAccountID: number | undefined;
    selfDMReportID: string | undefined;
};

/**
 * Keeps explicitly referenced reports, the self-DM report, and policy expense chats for known policies
 * (so `getPolicyExpenseChat` / selfDM fallbacks still work with a narrowed collection).
 */
function createReportsForSplitExpenseSelector({reportIDs, policyIDs, policyExpenseChatOwnerAccountID, selfDMReportID}: ReportsForSplitExpenseSelectorParams) {
    const reportIDSet = new Set(reportIDs.filter(Boolean));
    const policyIDSet = new Set(policyIDs.filter(Boolean));
    if (selfDMReportID) {
        reportIDSet.add(selfDMReportID);
    }

    return (reports: OnyxCollection<Report>): OnyxCollection<Report> => {
        if (!reports) {
            return {};
        }

        const result: NonNullable<OnyxCollection<Report>> = {};
        for (const report of Object.values(reports)) {
            if (!report?.reportID) {
                continue;
            }

            const key = `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}` as const;
            if (reportIDSet.has(report.reportID) || (selfDMReportID && report.reportID === selfDMReportID) || isSelfDM(report)) {
                result[key] = report;
                continue;
            }

            if (
                policyExpenseChatOwnerAccountID &&
                report.policyID &&
                policyIDSet.has(report.policyID) &&
                isPolicyExpenseChat(report) &&
                !isThread(report) &&
                report.ownerAccountID === policyExpenseChatOwnerAccountID
            ) {
                result[key] = report;
            }
        }
        return result;
    };
}

function createReportActionsByReportIDsSelector(reportIDs: string[]) {
    const reportIDSet = new Set(reportIDs.filter(Boolean));

    return (allReportActions: OnyxCollection<ReportActions>): OnyxCollection<ReportActions> => {
        if (!allReportActions || reportIDSet.size === 0) {
            return {};
        }

        const result: NonNullable<OnyxCollection<ReportActions>> = {};
        for (const reportID of reportIDSet) {
            const key = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}` as const;
            result[key] = allReportActions[key];
        }
        return result;
    };
}

function createReportNameValuePairsByIDsSelector(reportIDs: string[]) {
    const reportIDSet = new Set(reportIDs.filter(Boolean));

    return (allNVPs: OnyxCollection<ReportNameValuePairs>): OnyxCollection<ReportNameValuePairs> => {
        if (!allNVPs || reportIDSet.size === 0) {
            return {};
        }

        const result: NonNullable<OnyxCollection<ReportNameValuePairs>> = {};
        for (const reportID of reportIDSet) {
            const key = `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}` as const;
            result[key] = allNVPs[key];
        }
        return result;
    };
}

function createPolicyTagsByIDsSelector(policyIDs: string[]) {
    const policyIDSet = new Set(policyIDs.filter(Boolean));

    return (allPolicyTags: OnyxCollection<PolicyTagLists>): OnyxCollection<PolicyTagLists> => {
        if (!allPolicyTags || policyIDSet.size === 0) {
            return {};
        }

        const result: NonNullable<OnyxCollection<PolicyTagLists>> = {};
        for (const policyID of policyIDSet) {
            const key = `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}` as const;
            result[key] = allPolicyTags[key];
        }
        return result;
    };
}

/**
 * Keeps policies referenced by the split plus any policy that has enabled mileage rates
 * (needed for cross-policy rate lookup and `hasAvailableEnabledRates`).
 */
function createPoliciesForSplitExpenseSelector(policyIDs: string[]) {
    const policyIDSet = new Set(policyIDs.filter(Boolean));

    return (policies: OnyxCollection<Policy>): OnyxCollection<Policy> => {
        if (!policies) {
            return {};
        }

        const result: NonNullable<OnyxCollection<Policy>> = {};
        for (const policy of Object.values(policies)) {
            if (!policy?.id) {
                continue;
            }
            const key = `${ONYXKEYS.COLLECTION.POLICY}${policy.id}` as const;
            if (policyIDSet.has(policy.id) || Object.keys(DistanceRequestUtils.getMileageRates(policy)).length > 0) {
                result[key] = policy;
            }
        }
        return result;
    };
}

type SnapshotsForSplitExpenseSelectorParams = {
    transactionIDs: string[];
    searchHashes: Array<number | undefined>;
};

/**
 * Keeps snapshots that already contain any of the split's transactions, plus the active search
 * snapshots so create-from-Search can still write into the open results view.
 */
function createSnapshotsForSplitExpenseSelector({transactionIDs, searchHashes}: SnapshotsForSplitExpenseSelectorParams) {
    const transactionKeys = transactionIDs.filter(Boolean).map((id) => `${ONYXKEYS.COLLECTION.TRANSACTION}${id}`);
    const searchHashKeys = new Set(searchHashes.filter((hash): hash is number => hash !== undefined && hash >= 0).map((hash) => `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`));

    return (allSnapshots: OnyxCollection<SearchResults>): OnyxCollection<SearchResults> => {
        if (!allSnapshots) {
            return {};
        }

        const result: NonNullable<OnyxCollection<SearchResults>> = {};
        for (const [snapshotKey, snapshot] of Object.entries(allSnapshots)) {
            if (searchHashKeys.has(snapshotKey)) {
                result[snapshotKey] = snapshot;
                continue;
            }

            const data = snapshot?.data;
            if (!data || transactionKeys.length === 0) {
                continue;
            }
            if (transactionKeys.some((key) => Object.hasOwn(data, key))) {
                result[snapshotKey] = snapshot;
            }
        }
        return result;
    };
}

/**
 * Mirrors `useAllTransactions` search-merge behavior, but only for transactions that pass the
 * same split-related inclusion rules — so Search-page opens still see snapshot-only expenses.
 */
function mergeSearchTransactionsForSplitExpense(
    collectionTransactions: OnyxCollection<Transaction> | undefined,
    searchData: SearchResults['data'] | undefined,
    params: SplitRelatedTransactionsSelectorParams,
): OnyxCollection<Transaction> | undefined {
    if (!searchData) {
        return collectionTransactions;
    }

    const selectFromSearch = createSplitRelatedTransactionsSelector(params);
    const searchTransactions: NonNullable<OnyxCollection<Transaction>> = {};
    for (const key of Object.keys(searchData)) {
        if (!isTransactionCollectionKey(key)) {
            continue;
        }
        const value: OnyxEntry<Transaction> | undefined = searchData[key];
        if (value) {
            searchTransactions[key] = value;
        }
    }

    return {
        ...selectFromSearch(searchTransactions),
        ...collectionTransactions,
    };
}

export {
    createSplitRelatedTransactionsSelector,
    createReportsForSplitExpenseSelector,
    createReportActionsByReportIDsSelector,
    createReportNameValuePairsByIDsSelector,
    createPolicyTagsByIDsSelector,
    createPoliciesForSplitExpenseSelector,
    createSnapshotsForSplitExpenseSelector,
    mergeSearchTransactionsForSplitExpense,
};
