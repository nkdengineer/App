import type ReceiptStorageType from '@libs/ReceiptStorage/types';

import CONST from '@src/CONST';

import createMock from '../../utils/createMock';

const mockPut = jest.fn<Promise<void>, [string, string, Response]>();
const mockGet = jest.fn<Promise<Response | undefined>, [string, string]>();
const mockRemove = jest.fn<Promise<boolean>, [string, string]>();
const mockClear = jest.fn<Promise<boolean>, [string | undefined]>();

jest.mock('@libs/CacheAPI', () => ({
    __esModule: true,
    default: {
        put: (...args: [string, string, Response]) => mockPut(...args),
        get: (...args: [string, string]) => mockGet(...args),
        remove: (...args: [string, string]) => mockRemove(...args),
        clear: (...args: [string | undefined]) => mockClear(...args),
        init: jest.fn(),
    },
}));

// Jest resolves the bare specifier to native, so import the web implementation by path.
const {default: ReceiptStorage}: {default: ReceiptStorageType} = jest.requireActual('@libs/ReceiptStorage/index.ts');

const BLOB_URL = 'blob:http://localhost/receipt-1';
const REMINTED_URL = 'blob:http://localhost/receipt-reminted';
const TRANSACTION_ID = 'tx_1';
const MOCK_BLOB = new Blob(['receipt-bytes'], {type: 'image/png'});

const createMockResponse = (ok = true): Response =>
    createMock<Response>({
        ok,
        blob: jest.fn().mockResolvedValue(MOCK_BLOB),
    });

describe('ReceiptStorage (web)', () => {
    let createObjectURLSpy: jest.SpiedFunction<typeof URL.createObjectURL>;

    beforeEach(() => {
        ReceiptStorage.clear();
        jest.clearAllMocks();
        mockPut.mockResolvedValue(undefined);
        mockGet.mockResolvedValue(undefined);
        mockRemove.mockResolvedValue(true);
        mockClear.mockResolvedValue(true);
        jest.spyOn(global, 'fetch').mockResolvedValue(createMockResponse());
        createObjectURLSpy = jest.spyOn(URL, 'createObjectURL').mockReturnValue(REMINTED_URL);
        jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('resolve', () => {
        it('returns a blob URL remembered this session', () => {
            ReceiptStorage.remember(BLOB_URL);

            expect(ReceiptStorage.resolve(BLOB_URL)).toBe(BLOB_URL);
        });

        it('does not return a blob URL from a previous page load', () => {
            expect(ReceiptStorage.resolve(BLOB_URL)).toBeUndefined();
        });

        it('passes a remote source through', () => {
            expect(ReceiptStorage.resolve('https://www.expensify.com/receipts/w_9.jpg')).toBe('https://www.expensify.com/receipts/w_9.jpg');
        });
    });

    describe('adopt', () => {
        it('remembers a blob URL so resolve still returns it', async () => {
            await ReceiptStorage.adopt(BLOB_URL);

            expect(ReceiptStorage.resolve(BLOB_URL)).toBe(BLOB_URL);
        });
    });

    describe('revive', () => {
        it('returns the live blob URL and copies it into the Cache API', async () => {
            ReceiptStorage.remember(BLOB_URL);

            await expect(ReceiptStorage.revive(TRANSACTION_ID, BLOB_URL)).resolves.toBe(BLOB_URL);

            expect(mockPut).toHaveBeenCalledWith(CONST.CACHE_API_KEYS.RECEIPTS, expect.stringContaining(TRANSACTION_ID), expect.anything());
        });

        it('mints a new object URL from the Cache API when the stored blob URL is dead', async () => {
            jest.mocked(global.fetch).mockRejectedValue(new TypeError('Failed to fetch'));
            mockGet.mockResolvedValue(createMockResponse());

            await expect(ReceiptStorage.revive(TRANSACTION_ID, BLOB_URL)).resolves.toBe(REMINTED_URL);
            expect(createObjectURLSpy).toHaveBeenCalledWith(MOCK_BLOB);
        });

        it('returns undefined when the blob URL is dead and nothing is cached', async () => {
            jest.mocked(global.fetch).mockRejectedValue(new TypeError('Failed to fetch'));

            await expect(ReceiptStorage.revive(TRANSACTION_ID, BLOB_URL)).resolves.toBeUndefined();
        });
    });
});
