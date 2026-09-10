import ReceiptStorage from '@libs/ReceiptStorage';

import type {Transaction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useEffect, useState} from 'react';

/**
 * Resolves a transaction's receipt.localSource into a URI that can be rendered this session.
 * On web a stored blob URL dies on refresh, so this mints a new one from the Cache API when needed.
 */
function useReceiptLocalSource(transaction: OnyxEntry<Transaction> | undefined): string | undefined {
    const storedSource = transaction?.receipt?.localSource ?? undefined;
    const transactionID = transaction?.transactionID;
    const resolved = ReceiptStorage.resolve(storedSource);

    const [revived, setRevived] = useState<{storedSource: string; url: string | undefined} | undefined>(undefined);

    useEffect(() => {
        if (resolved) {
            // Cache a live blob so a later refresh can mint a new object URL. The live URL is already usable.
            if (storedSource && transactionID) {
                ReceiptStorage.revive(transactionID, storedSource);
            }
            return;
        }

        if (!storedSource || !transactionID) {
            return;
        }

        let isActive = true;
        let ownedBlobURL: string | undefined;
        const isOwnedBlobURL = (result: string): boolean => result !== storedSource && result.startsWith('blob:');

        ReceiptStorage.revive(transactionID, storedSource)
            .then((result) => {
                if (!isActive) {
                    if (result && isOwnedBlobURL(result)) {
                        URL.revokeObjectURL(result);
                    }
                    return;
                }
                if (result && isOwnedBlobURL(result)) {
                    ownedBlobURL = result;
                }
                setRevived({storedSource, url: result});
            })
            .catch(() => {
                if (!isActive) {
                    return;
                }
                setRevived({storedSource, url: undefined});
            });

        return () => {
            isActive = false;
            if (ownedBlobURL) {
                URL.revokeObjectURL(ownedBlobURL);
            }
        };
    }, [storedSource, resolved, transactionID]);

    if (!storedSource) {
        return undefined;
    }

    if (resolved) {
        return resolved;
    }

    return revived?.storedSource === storedSource ? revived.url : undefined;
}

export default useReceiptLocalSource;
