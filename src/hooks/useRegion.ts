'use client';

import { useState, useEffect } from 'react';
import regions, { type RegionData } from '@/app/metadata/regions';

export function useRegion() {
  const [regionData, setRegionData] = useState<RegionData>(regions.default);

  useEffect(() => {
    const hostname = window.location.hostname.split('.')[0];
    let regionKey = 'default';
    
    if (hostname === 'simferopol') regionKey = 'simferopol';
    else if (hostname === 'yalta') regionKey = 'yalta';
    else if (hostname === 'alushta') regionKey = 'alushta';
    else if (hostname === 'sevastopol') regionKey = 'sevastopol';
    
    setRegionData(regions[regionKey] || regions.default);
  }, []);

  return regionData;
}

