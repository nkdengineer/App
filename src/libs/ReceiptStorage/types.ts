import type {ReceiptSource} from '@src/types/onyx/Transaction';

/** Owns durable receipt bytes. Native writes the receipts folder. Web copies live blob URLs into the Cache API so they can be rebuilt after a refresh. */
type ReceiptStorage = {
    /** Moves a file into the receipts folder and returns its durable name. Rejects when the file did not land. */
    adopt: (uriOrPath: string, fileName?: string) => Promise<string>;

    /** Valid for this launch only, so never store the result. */
    toLocalUri: (durableName: string) => string;

    /** Re-roots a stored source onto the current folder. A remote source passes through unchanged. */
    resolve: (source: ReceiptSource | null | undefined) => string | undefined;

    /** Marks a blob URL as created this session so resolve still returns it. */
    remember: (source: string | undefined) => void;

    /** Returns a usable URI for a stored local source, minting a new blob URL from cache when the original is dead. */
    revive: (transactionID: string, source: string) => Promise<string | undefined>;

    /** Drops the cached bytes for a transaction. */
    drop: (transactionID: string) => void;

    /** Drops every cached receipt. Used on sign-out. */
    clear: () => void;
};

export default ReceiptStorage;
