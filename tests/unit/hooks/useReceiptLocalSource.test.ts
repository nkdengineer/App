import {renderHook, waitFor} from '@testing-library/react-native';

import useReceiptLocalSource from '@hooks/useReceiptLocalSource';

import ReceiptStorage from '@libs/ReceiptStorage';

import type {Transaction} from '@src/types/onyx';

import createMock from '../../utils/createMock';

jest.mock('@libs/ReceiptStorage', () => ({
    __esModule: true,
    default: {
        resolve: jest.fn(),
        revive: jest.fn(),
        remember: jest.fn(),
        drop: jest.fn(),
        clear: jest.fn(),
        adopt: jest.fn(),
        toLocalUri: jest.fn(),
    },
}));

const BLOB_URL = 'blob:http://localhost/receipt-1';
const REMINTED_URL = 'blob:http://localhost/receipt-reminted';
const TRANSACTION_ID = 'tx_1';

function buildTransaction(localSource?: string): Transaction {
    return createMock<Transaction>({
        transactionID: TRANSACTION_ID,
        receipt: localSource ? {localSource} : {},
    });
}

describe('useReceiptLocalSource', () => {
    let revokeObjectURLSpy: jest.SpiedFunction<typeof URL.revokeObjectURL>;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(ReceiptStorage.resolve).mockReturnValue(undefined);
        jest.mocked(ReceiptStorage.revive).mockResolvedValue(undefined);
        revokeObjectURLSpy = jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns a blob URL remembered this session immediately', () => {
        jest.mocked(ReceiptStorage.resolve).mockReturnValue(BLOB_URL);

        const {result} = renderHook(() => useReceiptLocalSource(buildTransaction(BLOB_URL)));

        expect(result.current).toBe(BLOB_URL);
        expect(ReceiptStorage.revive).toHaveBeenCalledWith(TRANSACTION_ID, BLOB_URL);
    });

    it('mints a new object URL after a refresh when revive recovers the bytes', async () => {
        jest.mocked(ReceiptStorage.revive).mockResolvedValue(REMINTED_URL);

        const {result} = renderHook(() => useReceiptLocalSource(buildTransaction(BLOB_URL)));

        expect(result.current).toBeUndefined();

        await waitFor(() => {
            expect(result.current).toBe(REMINTED_URL);
        });
    });

    it('returns undefined when the blob URL is dead and nothing is cached, so the remote receipt can show', async () => {
        const {result} = renderHook(() => useReceiptLocalSource(buildTransaction(BLOB_URL)));

        await waitFor(() => {
            expect(ReceiptStorage.revive).toHaveBeenCalledWith(TRANSACTION_ID, BLOB_URL);
        });
        expect(result.current).toBeUndefined();
    });

    it('revokes a minted object URL on unmount', async () => {
        jest.mocked(ReceiptStorage.revive).mockResolvedValue(REMINTED_URL);

        const {result, unmount} = renderHook(() => useReceiptLocalSource(buildTransaction(BLOB_URL)));

        await waitFor(() => {
            expect(result.current).toBe(REMINTED_URL);
        });

        unmount();

        expect(revokeObjectURLSpy).toHaveBeenCalledWith(REMINTED_URL);
    });
});
