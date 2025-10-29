import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    MAX_EXPENSE_AMOUNT_NO_ITEMIZED_RECEIPT: 'maxExpenseAmountNoItemizedReceipt',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type RulesItemizedReceiptRequiredAmountForm = Form<
    InputID,
    {
        [INPUT_IDS.MAX_EXPENSE_AMOUNT_NO_ITEMIZED_RECEIPT]: string;
    }
>;

export type {RulesItemizedReceiptRequiredAmountForm};
export default INPUT_IDS;

