import CacheAPI from '@libs/CacheAPI';
import Log from '@libs/Log';

import CONST from '@src/CONST';

import type ReceiptStorage from './types';

const liveBlobURLs = new Set<string>();
const cachedTransactionIDs = new Set<string>();

/**
 * Build a stable, absolute Cache API key for a receipt.
 *
 * The Cache API stores a string key as a Request, resolving relative URLs against the current
 * document.baseURI. Anchoring the key to the origin keeps put/get/remove consistent regardless of
 * the route in use. A blob URL cannot be the key: Cache.put only accepts http(s) schemes.
 */
function getReceiptCacheKey(transactionID: string): string {
    return new URL(`/__cache__/receipts/${encodeURIComponent(transactionID)}`, window.location.origin).toString();
}

function isBlobURL(source: string): boolean {
    return source.startsWith('blob:');
}

const remember: ReceiptStorage['remember'] = (source) => {
    if (!source || !isBlobURL(source)) {
        return;
    }
    liveBlobURLs.add(source);
};

async function putCache(transactionID: string, response: Response) {
    await CacheAPI.put(CONST.CACHE_API_KEYS.RECEIPTS, getReceiptCacheKey(transactionID), response);
    cachedTransactionIDs.add(transactionID);
}

async function cache(transactionID: string, source: string) {
    if (cachedTransactionIDs.has(transactionID) || !isBlobURL(source)) {
        return;
    }
    try {
        const response = await fetch(source);
        if (!response.ok) {
            return;
        }
        await putCache(transactionID, response);
    } catch (error) {
        Log.warn('[ReceiptStorage] Failed to cache local receipt', {error});
    }
}

const adopt: ReceiptStorage['adopt'] = (uriOrPath) => {
    remember(uriOrPath);
    return Promise.resolve(uriOrPath);
};

const toLocalUri: ReceiptStorage['toLocalUri'] = (durableName) => durableName;

const resolve: ReceiptStorage['resolve'] = (source) => {
    if (typeof source !== 'string') {
        return undefined;
    }
    // After a refresh the string is still in Onyx but the Blob is gone, so skip it until revive mints a new URL.
    if (isBlobURL(source) && !liveBlobURLs.has(source)) {
        return undefined;
    }
    return source;
};

const revive: ReceiptStorage['revive'] = async (transactionID, source) => {
    if (!source) {
        return undefined;
    }

    if (liveBlobURLs.has(source) || !isBlobURL(source)) {
        if (isBlobURL(source)) {
            await cache(transactionID, source);
        }
        return source;
    }

    try {
        const response = await fetch(source);
        if (response.ok) {
            liveBlobURLs.add(source);
            await putCache(transactionID, response);
            return source;
        }
    } catch {
        // The blob URL did not survive this page load. Read the Cache API copy next.
    }

    try {
        const cached = await CacheAPI.get(CONST.CACHE_API_KEYS.RECEIPTS, getReceiptCacheKey(transactionID));
        if (!cached) {
            return undefined;
        }
        const blob = await cached.blob();
        const url = URL.createObjectURL(blob);
        liveBlobURLs.add(url);
        return url;
    } catch (error) {
        Log.warn('[ReceiptStorage] Failed to revive local receipt', {error});
        return undefined;
    }
};

const drop: ReceiptStorage['drop'] = (transactionID) => {
    cachedTransactionIDs.delete(transactionID);
    CacheAPI.remove(CONST.CACHE_API_KEYS.RECEIPTS, getReceiptCacheKey(transactionID));
};

const clear: ReceiptStorage['clear'] = () => {
    liveBlobURLs.clear();
    cachedTransactionIDs.clear();
    CacheAPI.clear(CONST.CACHE_API_KEYS.RECEIPTS);
};

const receiptStorage: ReceiptStorage = {
    adopt,
    toLocalUri,
    resolve,
    remember,
    revive,
    drop,
    clear,
};

export default receiptStorage;
