# Example Transaction Verification

## What to verify

For an anchored record, verify these fields:

- `proofRecordHash`
- `proofTxHash`
- `proofExplorerUrl`

## Explorer format

```text
https://testnet.symbol.fyi/transactions/<txHash>
```

## Expected on-chain message

The Symbol transfer transaction should contain a plain message in this format:

```text
FOUNDPROOF:<recordHash>
```

## Example flow

1. Open a record detail page in the app.
2. Copy the `Transaction hash`.
3. Open the explorer link.
4. Confirm the transaction exists on Symbol Testnet.
5. Inspect the plain message payload.
6. Confirm the message includes the same `recordHash` shown in the app.

If the `recordHash` shown in the record detail matches the message on-chain, the proof anchor is consistent.
