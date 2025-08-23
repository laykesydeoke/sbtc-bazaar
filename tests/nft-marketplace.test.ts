
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const address1 = accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;

describe("sBTC Bazaar NFT Marketplace Tests", () => {
  it("ensures simnet is well initialised", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  it("gets initial token count", () => {
    const { result } = simnet.callReadOnlyFn("nft-marketplace", "get-last-token-id", [], address1);
    expect(result).toBeUint(0);
  });

  it("gets marketplace fee", () => {
    const { result } = simnet.callReadOnlyFn("nft-marketplace", "get-marketplace-fee", [], address1);
    expect(result).toBeUint(250); // 2.5% fee
  });

  it("mints NFT with collateral and metadata", () => {
    const { result } = simnet.callPublicFn(
      "nft-marketplace", 
      "mint-nft", 
      [
        "u1000000", // 0.01 sBTC collateral
        '"Test NFT"',
        '"A test NFT for the marketplace"',
        '"https://example.com/nft1.png"'
      ], 
      address1
    );
    expect(result).toBeOk("u1");
  });

  it("gets token metadata after minting", () => {
    // First mint an NFT
    simnet.callPublicFn(
      "nft-marketplace", 
      "mint-nft", 
      [
        "u1000000",
        '"Test NFT"',
        '"A test NFT for the marketplace"',
        '"https://example.com/nft1.png"'
      ], 
      address1
    );

    // Then get its metadata
    const { result } = simnet.callReadOnlyFn("nft-marketplace", "get-token-metadata", ["u1"], address1);
    expect(result).toBeSome({
      name: "Test NFT",
      description: "A test NFT for the marketplace", 
      "image-uri": "https://example.com/nft1.png"
    });
  });

  it("lists NFT for sale", () => {
    // First mint an NFT
    simnet.callPublicFn(
      "nft-marketplace", 
      "mint-nft", 
      [
        "u1000000",
        '"Test NFT"',
        '"A test NFT for the marketplace"',
        '"https://example.com/nft1.png"'
      ], 
      address1
    );

    // Then list it for sale
    const { result } = simnet.callPublicFn(
      "nft-marketplace", 
      "list-nft", 
      ["u1", "u5000000"], // 0.05 sBTC price
      address1
    );
    expect(result).toBeOk(true);
  });

  it("gets token listing", () => {
    // First mint and list an NFT
    simnet.callPublicFn(
      "nft-marketplace", 
      "mint-nft", 
      [
        "u1000000",
        '"Test NFT"',
        '"A test NFT for the marketplace"',
        '"https://example.com/nft1.png"'
      ], 
      address1
    );

    simnet.callPublicFn(
      "nft-marketplace", 
      "list-nft", 
      ["u1", "u5000000"],
      address1
    );

    // Then get the listing
    const { result } = simnet.callReadOnlyFn("nft-marketplace", "get-token-listing", ["u1"], address1);
    expect(result).toBeSome({
      price: "u5000000",
      seller: address1
    });
  });

  it("prevents minting with insufficient collateral", () => {
    const { result } = simnet.callPublicFn(
      "nft-marketplace", 
      "mint-nft", 
      [
        "u500000", // Less than minimum 1M satoshis
        '"Test NFT"',
        '"A test NFT"',
        '"https://example.com/nft1.png"'
      ], 
      address1
    );
    expect(result).toBeErr("u103"); // err-insufficient-collateral
  });
});
