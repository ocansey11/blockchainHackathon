import { getTxHistory, getFundedBy } from './etherscan';
import { getTokenSymbols, getContractAddressesInteracted } from './alchemy';
import { getRiskScoreFromLLM } from './llm';
import { getMockAddressData } from './mockAddressData';

// Set to true to use mock data instead of real API calls
const USE_MOCK_DATA = true;

export async function scamProfiler(address) {
  console.log('scamProfiler called with address:', address);
  
  try {
    // Use mock data if enabled
    if (USE_MOCK_DATA) {
      console.log('Using mock data for address:', address);
      const mockData = getMockAddressData(address);
      
      if (mockData) {
        console.log('Mock data found:', mockData);
        // Add a small delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
          score: mockData.score,
          profile: mockData.profile
        };
      }
    }

    // Fallback to real API calls if mock data is disabled or not available
    console.log('Making real API calls for address:', address);
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
