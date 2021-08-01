import { Transaction, TransactionInstruction } from "@solana/web3.js";
import bs58 from "bs58";

const DEFAULT_SIGNATURE = Buffer.alloc(64).fill(0);

export const populateTransaction = (message, signatures) => {
  const transaction = new Transaction();
  transaction.recentBlockhash = message.recentBlockhash;
  if (message.header.numRequiredSignatures > 0) {
    transaction.feePayer = message.accountKeys[0];
  }
  signatures.forEach((signature, index) => {
    const sigPubkeyPair = {
      signature:
        signature == bs58.encode(DEFAULT_SIGNATURE)
          ? null
          : bs58.decode(signature),
      publicKey: message.accountKeys[index],
    };
    transaction.signatures.push(sigPubkeyPair);
  });

  message.instructions.forEach(instruction => {
    const keys = instruction.accounts.map(account => {
      const pubkey = message.accountKeys[account];
      return {
        pubkey,
        isSigner: account < message.header.numRequiredSignatures,
        isWritable: message.isAccountWritable(account),
      };
    });

    transaction.instructions.push(
      new TransactionInstruction({
        keys,
        programId: message.accountKeys[instruction.programIdIndex],
        data: bs58.decode(instruction.data),
      }),
    );
  });

  return transaction;
};
