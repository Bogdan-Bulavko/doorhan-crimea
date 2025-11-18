'use client';

import { useState, useEffect } from 'react';
import { getRegionalContacts, getRegionFromClient, type RegionalContactData } from '@/lib/regional-data';

/**
 * Хук для получения региональных контактных данных
 */
export function useRegionalContacts(): RegionalContactData {
  const [contacts, setContacts] = useState<RegionalContactData>({
    phone: '',
    phoneFormatted: '',
    email: '',
    address: '',
    workingHours: '',
  });
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const region = getRegionFromClient();
        const regionalData = await getRegionalContacts(region);
        setContacts(regionalData);
      } catch (error) {
        console.error('Error loading regional contacts:', error);
      }
    };

    loadContacts();
  }, []);

  return contacts;
}

