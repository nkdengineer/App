import type {Route} from '@src/ROUTES';

// The 2FA success screen opens an accounting setup link when setup started from the accounting page.
// Xero is the default. This query keeps a different connector, such as Zoho Books, attached to that flow.
const ACCOUNTING_CONNECTION_QUERY_PARAM = 'accountingConnection';

function appendAccountingConnectionQuery(path: string, accountingConnection?: string): Route {
    if (!accountingConnection) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- path is already a Route when no connector query is added
        return path as Route;
    }

    const [pathWithoutQuery, query] = path.split('?');
    const params = new URLSearchParams(query);
    params.set(ACCOUNTING_CONNECTION_QUERY_PARAM, accountingConnection);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Navigation.navigate requires a Route, and this is an existing route plus the connector query the 2FA screens keep
    return `${pathWithoutQuery}?${params.toString()}` as Route;
}

function getAccountingConnectionFromParams(params: unknown): string | undefined {
    if (!params || typeof params !== 'object' || !(ACCOUNTING_CONNECTION_QUERY_PARAM in params)) {
        return undefined;
    }

    const value = (params as Record<string, unknown>)[ACCOUNTING_CONNECTION_QUERY_PARAM];
    return typeof value === 'string' ? value : undefined;
}

export {ACCOUNTING_CONNECTION_QUERY_PARAM, appendAccountingConnectionQuery, getAccountingConnectionFromParams};
