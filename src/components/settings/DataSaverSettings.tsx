import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Image, FileText, Zap } from 'lucide-react';

interface DataSaverSettings {
  enabled: boolean;
  compressImages: boolean;
  blurPreviews: boolean;
  preferText: boolean;
  autoDetect: boolean;
}

export default function DataSaverSettings() {
  const [settings, setSettings] = useState<DataSaverSettings>({
    enabled: false,
    compressImages: true,
    blurPreviews: true,
    preferText: true,
    autoDetect: true
  });

  const [connectionType, setConnectionType] = useState<string>('unknown');
  const [dataSaved, setDataSaved] = useState(0);

  useEffect(() => {
    loadSettings();
    detectConnection();
  }, []);

  const loadSettings = () => {
    const saved = localStorage.getItem('dataSaverSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    } else {
      // Auto-enable for first-time users in Kenya or slow connections
      const shouldAutoEnable = detectSlowConnection();
      if (shouldAutoEnable) {
        const autoSettings = { ...settings, enabled: true };
        setSettings(autoSettings);
        saveSettings(autoSettings);
      }
    }
  };

  const detectConnection = () => {
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      setConnectionType(conn.effectiveType || 'unknown');
      
      // Auto-enable data saver for slow connections
      if (settings.autoDetect && (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g')) {
        updateSetting('enabled', true);
      }
    }
  };

  const detectSlowConnection = () => {
    // Check for indicators of slow connection or Kenyan networks
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const isKenya = timezone === 'Africa/Nairobi';
    
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      const isSlowConnection = conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g';
      return isKenya || isSlowConnection;
    }
    
    return isKenya;
  };

  const saveSettings = (newSettings: DataSaverSettings) => {
    localStorage.setItem('dataSaverSettings', JSON.stringify(newSettings));
    
    // Apply settings globally
    document.documentElement.setAttribute('data-saver-enabled', newSettings.enabled.toString());
    document.documentElement.setAttribute('data-compress-images', newSettings.compressImages.toString());
    document.documentElement.setAttribute('data-blur-previews', newSettings.blurPreviews.toString());
    document.documentElement.setAttribute('data-prefer-text', newSettings.preferText.toString());
  };

  const updateSetting = (key: keyof DataSaverSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const getConnectionIcon = () => {
    if (connectionType.includes('2g')) return <WifiOff className="w-4 h-4 text-red-500" />;
    if (connectionType.includes('3g')) return <Wifi className="w-4 h-4 text-yellow-500" />;
    return <Wifi className="w-4 h-4 text-green-500" />;
  };

  const estimatedSavings = settings.enabled ? '60-80%' : '0%';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">Data Saver Mode</h3>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          {getConnectionIcon()}
          <span className="capitalize">{connectionType}</span>
        </div>
      </div>

      {/* Main Toggle */}
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg mb-4">
        <div>
          <div className="font-medium text-gray-900">Enable Data Saver</div>
          <div className="text-sm text-gray-600">Optimized for Kenyan networks</div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => updateSetting('enabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Data Savings Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{estimatedSavings}</div>
          <div className="text-sm text-green-700">Data Saved</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{dataSaved}MB</div>
          <div className="text-sm text-purple-700">This Session</div>
        </div>
      </div>

      {/* Individual Settings */}
      {settings.enabled && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Image className="w-4 h-4 text-gray-500" />
              <div>
                <div className="text-sm font-medium">Compress Images</div>
                <div className="text-xs text-gray-500">Reduce image quality for faster loading</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.compressImages}
                onChange={(e) => updateSetting('compressImages', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Image className="w-4 h-4 text-gray-500" />
              <div>
                <div className="text-sm font-medium">Blur Large Previews</div>
                <div className="text-xs text-gray-500">Tap to view full resolution</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.blurPreviews}
                onChange={(e) => updateSetting('blurPreviews', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="w-4 h-4 text-gray-500" />
              <div>
                <div className="text-sm font-medium">Prefer Text Content</div>
                <div className="text-xs text-gray-500">Show text posts first, media on demand</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.preferText}
                onChange={(e) => updateSetting('preferText', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Zap className="w-4 h-4 text-gray-500" />
              <div>
                <div className="text-sm font-medium">Auto-Detect Slow Connection</div>
                <div className="text-xs text-gray-500">Enable data saver automatically</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoDetect}
                onChange={(e) => updateSetting('autoDetect', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="text-sm text-yellow-800">
          💡 <strong>Tip:</strong> Data saver mode can reduce your data usage by up to 80% while maintaining full functionality.
        </div>
      </div>
    </div>
  );
}