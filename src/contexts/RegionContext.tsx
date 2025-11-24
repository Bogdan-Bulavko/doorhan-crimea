'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getRegionalContacts, getRegionFromClient, type RegionalContactData } from '@/lib/regional-data';

interface RegionContextType {
  currentRegion: string;
  regionalData: RegionalContactData | null;
  loading: boolean;
  setRegion: (region: string) => void;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function RegionProvider({ children }: { children: ReactNode }) {
  const [currentRegion, setCurrentRegion] = useState<string>('default');
  const [regionalData, setRegionalData] = useState<RegionalContactData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Определяем регион из hostname
    const region = getRegionFromClient();
    setCurrentRegion(region);
    loadRegionalData(region);
  }, []);

  const loadRegionalData = async (region: string) => {
    try {
      setLoading(true);
      const data = await getRegionalContacts(region);
      setRegionalData(data);
    } catch (error) {
      console.error('Error loading regional data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setRegion = (region: string) => {
    setCurrentRegion(region);
    loadRegionalData(region);
  };

  return (
    <RegionContext.Provider value={{ currentRegion, regionalData, loading, setRegion }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
}




