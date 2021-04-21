"use strict";

class BloctoSolanaWeb3Provider {

  /// publicKey
  /// isConnected
  /// autoApprove
  /// ??: network
  /// signTransaction: (transaction: Transaction) => Promise<Transaction>
  /// signAllTransactions: (transaction: Transaction[]) => Promise<Transaction[]>
  /// connect: () => any
  /// disconnect: () => any

  constructor(config) {
    // super();
    this.setConfig(config);

    this.isBlocto = true;
  }
}

window.BloctoSolanaWeb3Provider = BloctoSolanaWeb3Provider;
