import { Signature, Struct, PublicKey } from "o1js";
import { ApplicationState } from "./application";

export class TransactionInput extends Struct({
    initiator: PublicKey,
    currentApplicationState: ApplicationState,
    newApplicationState: ApplicationState,
    signature: Signature,
}) {
    constructor(initiator: PublicKey, currentApplicationState: ApplicationState, newApplicationState: ApplicationState, signature: Signature) {
        super({ initiator, currentApplicationState, newApplicationState, signature});
    }

    getCurrentApplicationState() {
        return this.currentApplicationState;
    }

    getNewApplicationState() {
        return this.newApplicationState;
    }

    static fromJSON({ initiator, currentApplicationState, newApplicationState, signature }: { initiator: any, currentApplicationState: any, newApplicationState: any, signature: any }) {
        return new TransactionInput(PublicKey.fromJSON(initiator), ApplicationState.fromJSON(currentApplicationState), ApplicationState.fromJSON(newApplicationState), Signature.fromJSON(signature));
    }

    toJSON() {
        return {
            currentApplicationState: this.currentApplicationState.toJSON(),
            newApplicationState: this.newApplicationState.toJSON(),
        };
    }
}