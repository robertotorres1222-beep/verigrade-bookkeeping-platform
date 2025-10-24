'use client';

import React, { useEffect } from 'react';
import { OfflineIndicator } from './OfflineIndicator';
import pwaService from '../services/pwaService';
import offlineDataManager from '../services/offlineDataManager';

interface PWAProviderProps {
  children: React.ReactNode;
}

const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize PWA services
    const initializePWA = async () => {
      try {
        // Initialize offline data manager
        await offlineDataManager.initialize();
        
        // Set up PWA event listeners
        pwaService.addEventListener((event) => {
          console.log('PWA Event:', event);
        });

        console.log('PWA services initialized');
      } catch (error) {
        console.error('Failed to initialize PWA services:', error);
      }
    };

    initializePWA();
  }, []);

  return (
    <>
      {children}
      <OfflineIndicator showDetails={false} position="top" />
    </>
  );
};

export default PWAProvider;

