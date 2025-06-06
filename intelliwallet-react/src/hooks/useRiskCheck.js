import { useState, useEffect } from 'react';
import { scamProfiler } from '../services/scamProfile';

export function useRiskCheck(address) {
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(false);
  const isBlocked = risk?.level === 'high';

  console.log('useRiskCheck called with address:', address);
    useEffect(() => {
    console.log('useRiskCheck useEffect triggered:', { address, length: address?.length });
    if (!address || address.length !== 42) {
      console.log('Address validation failed:', { address, length: address?.length, expected: 42 });
      return;
    }
    
    console.log('Starting risk check for:', address);
    setLoading(true);
    scamProfiler(address).then((r) => {
      console.log('scamProfiler returned:', r);
      console.log('r?.score:', r?.score);
      setRisk(r?.score || null);
      setLoading(false);
    }).catch((error) => {
      console.error('Risk check failed:', error);
      setRisk(null);
      setLoading(false);
    });
  }, [address]);

  return { risk, isBlocked, loading };
}
