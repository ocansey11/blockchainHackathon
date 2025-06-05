import { getTxHistory, getFundedBy } from './etherscan';
import { getTokenSymbols, getContractAddressesInteracted } from './alchemy';
import { getRiskScoreFromLLM } from './llm';

export async function scamProfiler(address) {
  try {
    const [txs, funder, tokens, contracts] = await Promise.all([
      getTxHistory(address),
      getFundedBy(address),
      getTokenSymbols(address),
      getContractAddressesInteracted(address)
    ]);

    const profile = {
      address,
      creation_date: txs[0]?.timeStamp
        ? new Date(parseInt(txs[0].timeStamp) * 1000).toISOString()
        : 'unknown',
      tx_count: txs.length,
      funded_by: funder,
      erc20_tokens: tokens,
      interacted_contracts: contracts,
    };

    const result = await getRiskScoreFromLLM(profile);
    return { score: result, profile };
  } catch (err) {
    console.error("scamProfiler error:", err);
    return {
      score: {
        emoji: "🟡",
        level: "medium",
        summary: "Could not verify address fully.",
        warning: "Some parts of the profile failed to load."
      },
      profile: null
    };
  }
}
