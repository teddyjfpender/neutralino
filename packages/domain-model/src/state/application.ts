import {Field, Poseidon, Struct } from "o1js";
import { Account } from "./account";
import { Transaction } from "../provable-programs";

export class ApplicationState extends Struct({
    userOne: Account,
    userTwo: Account,
}) {
    constructor(userOne: Account, userTwo: Account) {
        super({ userOne, userTwo });
    }

    getUserOne(): Account {
        return this.userOne;
    }

    getUserTwo(): Account {
        return this.userTwo;
    }

    static fromJSON({ userOne, userTwo }: { userOne: any, userTwo: any }): ApplicationState {
        return new ApplicationState(Account.fromJSON(userOne), Account.fromJSON(userTwo));
    }

    toJSON(): { userOne: any, userTwo: any } {
        return {
            userOne: this.userOne.toJSON(),
            userTwo: this.userTwo.toJSON(),
        };
    }

    toHash(): Field {
        return Poseidon.hash([...this.userOne.toHash().toFields(), ...this.userTwo.toHash().toFields()]);
    }
}