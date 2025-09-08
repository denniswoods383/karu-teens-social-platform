import { useState, useEffect } from 'react';

interface DataSaverSettings {
  enabled: boolean;
  compressImages: boolean;
  blurPreviews: boolean;
  preferText: boolean;
  autoDetect: boolean;
}

export const useDataSaver = () => {
  const [settings, setSettings] = useState<DataSaverSettings>({
    enabled: false,
    compressImages: true,
    blurPreviews: true,
    preferText: true,
    autoDetect: true
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const saved = localStorage.getItem('dataSaverSettings');
    if (saved) {
      const parsedSettings = JSON.parse(saved);
      setSettings(parsedSettings);
      applySettings(parsedSettings);
    }
  };

  const applySettings = (newSettings: DataSaverSettings) => {
    // Apply CSS classes for data saver mode
    document.documentElement.setAttribute('data-saver-enabled', newSettings.enabled.toString());
    document.documentElement.setAttribute('data-compress-images', newSettings.compressImages.toString());
    document.documentElement.setAttribute('data-blur-previews', newSettings.blurPreviews.toString());
    document.documentElement.setAttribute('data-prefer-text', newSettings.preferText.toString());
  };

  const getImageUrl = (originalUrl: string, compress: boolean = true) => {
    if (!settings.enabled || !settings.compressImages || !compress) {
      return originalUrl;
    }

    // Add compression parameters for Cloudinary or other CDNs
    if (originalUrl.includes('cloudinary.com')) {
      return originalUrl.replace('/upload/', '/upload/q_auto:low,f_auto,w_400/');
    }

    // For other URLs, you might want to use a compression service
    return originalUrl;
  };

  const shouldBlurPreview = (fileSize?: number) => {
    if (!settings.enabled || !settings.blurPreviews) return false;
    
    // Blur images larger than 100KB
    return !fileSize || fileSize > 100000;
  };

  const shouldPreferText = () => {
    return settings.enabled && settings.preferText;
  };

  const getConnectionQuality = () => {
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      return conn.effectiveType || 'unknown';
    }
    return 'unknown';
  };

  return {
    settings,
    getImageUrl,
    shouldBlurPreview,
    shouldPreferText,
    getConnectionQuality,
    isDataSaverEnabled: settings.enabled
  };
};