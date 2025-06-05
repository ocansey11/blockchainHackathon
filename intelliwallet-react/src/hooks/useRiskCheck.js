import { useState, useEffect } from 'react';
import { scamProfiler } from '../services/scamProfile';

export function useRiskCheck(address) {
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(false);
  const isBlocked = risk?.level === 'high';
  useEffect(() => {
    if (!address || address.length !== 42) return;
    setLoading(true);
    scamProfiler(address).then((r) => {
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
