'use client';

import { useState, useEffect } from 'react';
import { DevicePhoneMobileIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      console.log('PWA was installed');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  if (isInstalled || !showInstallBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg p-4 z-50 md:left-auto md:right-4 md:w-80">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <DevicePhoneMobileIcon className="w-6 h-6" />
          <div>
            <p className="font-semibold text-sm">Install VeriGrade</p>
            <p className="text-xs opacity-90">Access your bookkeeping platform anywhere</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleInstallClick}
            className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Install
          </button>
          <button
            onClick={() => setShowInstallBanner(false)}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
