import { describe, beforeAll, it, expect } from "bun:test";

import { Account, ApplicationState, Transaction, TransactionInput } from "../src";
import { PrivateKey, Signature, UInt64, verify } from "o1js";

// bun test test/transaction.test.ts --timeout 500000
describe("Transaction", () => {
    let artifacts: { verificationKey: string }
    let privateKeyOne: PrivateKey
    let accountOne: Account;
    let privateKeyTwo: PrivateKey;
    let accountTwo: Account;
    let applicationState: ApplicationState;

    beforeAll(async () => {
        console.log("compiling transaction program...")
        artifacts  = await Transaction.compile();
        privateKeyOne = PrivateKey.random();
        accountOne = new Account(privateKeyOne.toPublicKey(), UInt64.from(100), UInt64.from(0));
        privateKeyTwo = PrivateKey.random();
        accountTwo = new Account(privateKeyTwo.toPublicKey(), UInt64.from(0), UInt64.from(0));
        applicationState = new ApplicationState(accountOne, accountTwo);
    });

    it("should prove a transaction where userOne sends 25 to user two", async () => {
        // create base proof with the `applicationState` as the public output -- this is the first transaction for any Neutralino interaction
        const baseTransactionInput = new TransactionInput(privateKeyOne.toPublicKey(), applicationState, applicationState, Signature.create(privateKeyOne, [...applicationState.toHash().toFields(), ...applicationState.toHash().toFields()]));
        // create a proof for the base case
        console.log("proving base case...")
        const baseProof = await Transaction.baseCase(baseTransactionInput);
        // check that the proof is valid & has the expected application state
        const verified = await verify(baseProof, artifacts.verificationKey);
        expect(verified).toBeTruthy();
        expect(baseProof.publicOutput.getUserOne().address).toEqual(privateKeyOne.toPublicKey());
        expect( baseProof.publicOutput.getUserOne().amount).toEqual(UInt64.from(100));
        expect(baseProof.publicOutput.getUserOne().nonce).toEqual(UInt64.from(0));
        expect(baseProof.publicOutput.getUserTwo().address).toEqual(privateKeyTwo.toPublicKey());
        expect(baseProof.publicOutput.getUserTwo().amount).toEqual(UInt64.from(0));
        expect(baseProof.publicOutput.getUserTwo().nonce).toEqual(UInt64.from(0));

        // create a new application state
        console.log("creating new application state (i.e. transaction)...")
        const newApplicationState = new ApplicationState(new Account(privateKeyOne.toPublicKey(), UInt64.from(75), UInt64.from(1)), new Account(privateKeyTwo.toPublicKey(), UInt64.from(25), UInt64.from(0)));
        // sign the current application state and new application state together
        const signature = Signature.create(privateKeyOne, [...applicationState.toHash().toFields(), ...newApplicationState.toHash().toFields()]);
        // create a new transaction input
        const transactionInput = new TransactionInput(privateKeyOne.toPublicKey(), applicationState, newApplicationState, signature);
        // create a proof for the transaction
        console.log("proving transaction...")
        const transactionProof = await Transaction.send(transactionInput, baseProof);
        // check that the proof is valid & has the expected application state
        const transactionVerified = await verify(transactionProof, artifacts.verificationKey);
        expect(transactionVerified).toBeTruthy();
        expect(transactionProof.publicOutput.getUserOne().address).toEqual(privateKeyOne.toPublicKey());
        expect(transactionProof.publicOutput.getUserOne().amount).toEqual(UInt64.from(75));
        expect(transactionProof.publicOutput.getUserOne().nonce).toEqual(UInt64.from(1));
        expect(transactionProof.publicOutput.getUserTwo().address).toEqual(privateKeyTwo.toPublicKey());
        expect(transactionProof.publicOutput.getUserTwo().amount).toEqual(UInt64.from(25));
        expect(transactionProof.publicOutput.getUserTwo().nonce).toEqual(UInt64.from(0));
    });
});