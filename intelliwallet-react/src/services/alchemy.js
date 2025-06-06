import { Alchemy, Network } from "alchemy-sdk";

const apiKey = import.meta.env.VITE_ALCHEMY_API_KEY;

// Check if API key is available and not empty
if (!apiKey || apiKey === 'demo') {
  console.warn('⚠️ VITE_ALCHEMY_API_KEY is missing or using demo key. Alchemy services will return empty data.');
}

const alchemy = new Alchemy({
  apiKey: apiKey || 'demo',
  network: Network.ETH_MAINNET
});

export async function getTokenSymbols(address) {
  try {
    // Return empty array if no proper API key
    if (!apiKey || apiKey === 'demo') {
      console.warn('Skipping token symbols fetch - no valid API key');
      return [];
    }
    
    const balances = await alchemy.core.getTokenBalances(address);
    const symbols = await Promise.all(
      balances.tokenBalances
        .filter((b) => b.tokenBalance !== "0x0")
        .slice(0, 10)
        .map(async (token) => {
          const meta = await alchemy.core.getTokenMetadata(token.contractAddress);
          return meta.symbol || "UNKNOWN";
        })
    );
    return symbols;
  } catch (e) {
    console.error("getTokenSymbols error:", e);
    return [];
  }
}

export async function getContractAddressesInteracted(address) {
  try {
    // Return empty array if no proper API key
    if (!apiKey || apiKey === 'demo') {
      console.warn('Skipping contract addresses fetch - no valid API key');
      return [];
    }
    
    const transfers = await alchemy.core.getAssetTransfers({
      fromBlock: "0x0",
      toAddress: address,
      category: ["external", "erc20", "erc721", "erc1155"],
      maxCount: 100
    });

    const uniqueAddresses = [...new Set(
      transfers.transfers.map(t => t.rawContract?.address).filter(Boolean)
    )];

    return uniqueAddresses;
  } catch (e) {
    console.error("getContractAddressesInteracted error:", e);
    return [];
  }
}
