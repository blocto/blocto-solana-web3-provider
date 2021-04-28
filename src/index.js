"use strict";

import EventEmitter from 'eventemitter3';
import { PublicKey, Message } from '@solana/web3.js';
import { populateTransaction } from './utils';

const walletProgramIds = {
  'mainnet-beta': 'JBn9VwAiqpizWieotzn6FjEXrBu4fDe2XFjiFqZwp8Am',
  'testnet': 'BHTYXRppkVxNmhAjyN8Gkmrm5VMMXY8omv4Z9bcWLSG2'
}

class BloctoSolanaWeb3Provider extends EventEmitter {

  constructor(config) {
    super();

    this.isBlocto = true;
    this._publicKey = null;
    this._autoApprove = false;
    this._network = config.network;
    if (config.address) {
      this._setPublicKey(new PublicKey(config.address)); 
    }

    this._nextRequestId = 100000;
    this._responsePromises = new Map();
  }

  get publicKey() {
    return this._publicKey;
  }

  get connected() {
    return this._publicKey !== null;
  }

  get autoApprove() {
    return this._autoApprove;
  }

  get network() {
    return this._network;
  }

  sendResponse(jsonString) {
    const json = JSON.parse(jsonString);
    window.dispatchEvent(new CustomEvent("blocto_provider_message", { detail: json }));
  }

  // for supporting sol-wallet-adapter
  // https://github.com/project-serum/sol-wallet-adapter
  postMessage(message) {
    if (message.method === 'connect') {
      if (!this._handlerAdded) {
        this._handlerAdded = true;
        window.addEventListener('beforeunload', this.disconnect);
      }
    }

    const listener = (event) => {
      if (event.detail.id === message.id) {
        window.removeEventListener('blocto_provider_message', listener);
        switch (message.method) {
        case 'connect':
          if (event.detail.params && event.detail.params.publicKey) {
            event.detail.method = 'connected';
            const newPublicKey = new PublicKey(event.detail.params.publicKey);
            if (!this._publicKey || !this._publicKey.equals(newPublicKey)) {
              if (this._publicKey && !this._publicKey.equals(newPublicKey)) {
                this._handleDisconnect();
              }
              this._setPublicKey(newPublicKey);
              this._autoApprove = !!event.detail.params.autoApprove;
            }
            if (newPublicKey) {
              this.emit('connect', newPublicKey);
            }
          }
          break
        case 'disconnet':
          event.detail.method = 'disconnected';
          this._handleDisconnect()
          break
        default: {
          if (message.method == 'convertToProgramWalletTransaction') {
            // replace to web3 transaction object
            const buffer = Buffer.from(event.detail.result, 'hex');
            const message = Message.from(buffer)
            const transaction = populateTransaction(message, []);
            event.detail.result = transaction;
          }

          if (event.detail.result || event.detail.error) {
            if (this._responsePromises.has(event.detail.id)) {
              const [resolve, reject] = this._responsePromises.get(event.detail.id);
              if (event.detail.result) {
                resolve(event.detail.result);
              } else {
                reject(new Error(event.detail.error));
              }
            }
          }
          break
        }}
        window.postMessage(event.detail);
      }
    };
    window.addEventListener('blocto_provider_message', listener);

    if (window.webkit == undefined) {
      window.dispatchEvent(new CustomEvent("blocto-solana", { detail: message }));
    } else {
      window.webkit.messageHandlers['blocto-solana'].postMessage(message);
    }
  }

  // for supporting Phantom-like wallet
  // https://docs.phantom.app/integrating/establishing-a-connection
  request(data) {
    const method = data.method;
    const params = data.params;
    if (method !== 'connect' && !this.connected) {
      throw new Error('Wallet not connected');
    }
    switch (method) {
      case 'signTransaction':
        throw new Error('Blocto is program wallet, which doesn\'t support signTransaction. Use signAndSendTransaction instead.');
      case 'signAllTransactions':
        throw new Error('Blocto is program wallet, which doesn\'t support signAllTransactions. Use signAndSendTransaction instead.');
    }
    const requestId = this._nextRequestId;
    ++this._nextRequestId;
    return new Promise((resolve, reject) => {
      this._responsePromises.set(requestId, [resolve, reject]);
      this.postMessage({
        jsonrpc: '2.0',
        id: requestId,
        method,
        params: {
          network: this._network,
          ...params,
        },
      });
    });
  }

  connect() {
    if (!this._handlerAdded) {
      this._handlerAdded = true;
      window.addEventListener('beforeunload', this.disconnect);
    }

    return new Promise((resolve) => {
      this.request({ method: 'connect' });
      resolve();
    });
  }

  disconnect() {
    this.request({ method: 'disconnect' });
  }

  signTransaction(transaction) {
    return this.request({
      method: 'signTransaction',
      params: {
        message: transaction.serializeMessage().toString('hex')
      }});
  }

  signAllTransactions(transactions) {
    const message = transactions.map(transaction => {
      return transaction.serializeMessage().toString('hex');
    });
    return this.request({
      method: 'signAllTransactions',
      params: {
        message
      }});
  }

  convertToProgramWalletTransaction(transaction) {
    return this.request({
      method: 'convertToProgramWalletTransaction',
      params: {
        message: transaction.serializeMessage().toString('hex')
      }});
  }

  signAndSendTransaction(transaction) {
    var publicKeySignaturePairs = {}
    transaction.signatures.forEach(pair => {
      if (pair.signature) {
        publicKeySignaturePairs[pair.publicKey.toBase58()] = pair.signature.toString('hex')
      }
    })
    var isInvokeWrapped = false
    if (walletProgramIds[this._network]) {
      isInvokeWrapped = !transaction.instructions.every(instruction => {
        if (instruction.programId) {
          return instruction.programId != walletProgramIds[this._network]
        } else {
          return true
        }
      })
    }
    return this.request({
      method: 'signAndSendTransaction',
      params: {
        publicKeySignaturePairs: publicKeySignaturePairs,
        message: transaction.serializeMessage().toString('hex'),
        isInvokeWrapped
      }});
  }

  _setPublicKey(publicKey) {
    if (publicKey) {
      this._publicKey = publicKey;

      for (var i = 0; i < window.frames.length; i++) {
        const frame = window.frames[i];
        if (frame.solana.isBlocto) {
          frame.solana._publicKey = this._publicKey;
        }
      }
    }
  }

  _handleDisconnect() {
    if (this._handlerAdded) {
      this._handlerAdded = false;
      window.removeEventListener('beforeunload', this.disconnect);
    }
    if (this._publicKey) {
      this._publicKey = null;
      this.emit('disconnect');
    }
    this._responsePromises.forEach(([resolve, reject], id) => {
      this._responsePromises.delete(id);
      reject('Wallet disconnected');
    });
  }
}

window.BloctoSolana = BloctoSolanaWeb3Provider;
