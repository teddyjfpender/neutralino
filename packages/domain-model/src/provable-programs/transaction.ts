import { Experimental, Group, SelfProof, Signature, UInt64, ZkProgram } from 'o1js';
import { ApplicationState, TransactionInput } from '../state';


/**
 * Represents a Zero-Knowledge (ZK) program that constraints the state transition of an applicaiton state
 * between two users.
 * Contains methods that allow transaction validation and proving.
 */
export const Transaction = ZkProgram({
  name: 'Transaction',
  /** Public inputs of the transaction. */
  publicInput: TransactionInput,

  /** Public outputs of the transaction. */
  publicOutput: ApplicationState,

  methods: {
    baseCase: {
      privateInputs: [],
      method(publicInputs: TransactionInput): ApplicationState {
        return publicInputs.newApplicationState;
      }
    },

    send: {
      /** Private inputs */
      privateInputs: [SelfProof],
      /**
       * 
       * @param publicInputs 
       * @param lastStateProof 
       * @returns 
       */
      // I think this means only userOne can send money to userTwo, but userTwo can't send money to userOne
      method(publicInputs: TransactionInput, lastStateProof: SelfProof<ApplicationState, void>): ApplicationState {
        // verify the last proof
        lastStateProof.verify();
        // get amount sent by userOne
        const amountSent = publicInputs.currentApplicationState.getUserOne().getAmount().sub(publicInputs.newApplicationState.getUserOne().getAmount());
        // check that the signature is valid
        const validSignature = publicInputs.signature.verify(publicInputs.initiator, [...publicInputs.currentApplicationState.toHash().toFields(), ...publicInputs.newApplicationState.toHash().toFields()]);
        validSignature.assertTrue();
        // check amount send by userOne is less than or equal to the amount they have
        amountSent.assertLessThanOrEqual(publicInputs.currentApplicationState.getUserOne().getAmount());
        // check if nonce increased by 1 for userOne
        publicInputs.currentApplicationState.getUserOne().getNonce().add(UInt64.from(1)).assertEquals(publicInputs.newApplicationState.getUserOne().getNonce());
        // check if nonce unchanged for userTwo
        publicInputs.currentApplicationState.getUserTwo().getNonce().assertEquals(publicInputs.newApplicationState.getUserTwo().getNonce());
        // check if userTwo's account amount has increased by the amount sent by userOne
        publicInputs.currentApplicationState.getUserTwo().getAmount().add(amountSent).assertEquals(publicInputs.newApplicationState.getUserTwo().getAmount());
        
        return publicInputs.newApplicationState;
      },
    },
  },
});



/**
 * Represents a proof for the `Transaction` ZkProgram.
 * Holds necessary data for proving a transaction's validity without revealing private details.
 */
export class TransactionProof extends ZkProgram.Proof(Transaction){
  static publicInput = this.prototype.publicInput;
  static publicOutput = this.prototype.publicOutput;
};