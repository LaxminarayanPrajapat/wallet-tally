'use client';

import { useState, useEffect } from 'react';

export function useCurrencySymbol() {
  const [symbol, setSymbol] = useState<string | null>(null);

  useEffect(() => {
    const storedSymbol = localStorage.getItem('currencySymbol');
    setSymbol(storedSymbol ?? ''); // Returns null on SSR, then stored value or '' on client
  }, []);

  return symbol;
}
