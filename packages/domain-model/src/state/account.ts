import { Field, Poseidon, PublicKey, Struct, UInt64 } from "o1js";

export class Account extends Struct({
    address: PublicKey,
    amount: UInt64,
    nonce: UInt64,
}) { 
    constructor(address: PublicKey, amount: UInt64, nonce: UInt64) {
        super({ address, amount, nonce });
    }

    getAddress(): PublicKey {
        return this.address;
    }

    getAmount(): UInt64 {
        return this.amount;
    }

    getNonce(): UInt64 {
        return this.nonce;
    }

    static fromJSON({ address, amount, nonce }: { address: string, amount: string, nonce: string }): Account {
        return new Account(PublicKey.fromJSON(address), UInt64.fromJSON(amount), UInt64.fromJSON(nonce));
    }

    toJSON(): { address: string, amount: string, nonce: string } {
        return {
            address: this.address.toJSON(),
            amount: this.amount.toJSON(),
            nonce: this.nonce.toJSON(),
        };
    }

    toHash(): Field {
        return Poseidon.hash([...this.address.toFields(), ...this.amount.toFields(), ...this.nonce.toFields()]);
    }
}
