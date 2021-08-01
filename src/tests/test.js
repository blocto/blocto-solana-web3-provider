"use strict";

require("../index");
const BloctoSolanaWeb3Provider = window.BloctoSolana;

describe("BloctoSolanaWeb3Provider tests", () => {
  test("test constructor with config", () => {
    const provider = new BloctoSolanaWeb3Provider({ network: "testnet" });
    expect(provider.isBlocto).toBe(true);
    expect(provider.publicKey).toBe(null);
    expect(provider.connected).toBe(false);
    expect(provider.autoApprove).toBe(false);
    expect(provider.network).toBe("testnet");
  });

}); // end of top describe()
