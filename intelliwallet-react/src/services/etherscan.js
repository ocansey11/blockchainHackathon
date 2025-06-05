const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY;
const baseURL = "https://api.etherscan.io/api";

/**
 * Fetch normal transactions (external) for an address
 */
export async function getTxHistory(address) {
  const url = `${baseURL}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "1" || !data.result) return [];

    return data.result;
  } catch (err) {
    console.error("Etherscan TX error:", err);
    return [];
  }
}

/**
 * Find the first external funder of this address
 */
export async function getFundedBy(address) {
  const txs = await getTxHistory(address);
  if (txs.length === 0) return null;

  const incoming = txs.find(tx => tx.to?.toLowerCase() === address.toLowerCase());
  return incoming?.from || null;
}
