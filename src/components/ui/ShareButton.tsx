import { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';

interface ShareButtonProps {
  url: string;
  title: string;
  text?: string;
}

export default function ShareButton({ url, title, text }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      setShowMenu(true);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShowMenu(false);
    } catch (error) {
      console.error('Failed to copy');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleNativeShare}
        className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </button>

      {showMenu && (
        <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-10">
          <button
            onClick={copyToClipboard}
            className="flex items-center space-x-2 w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      )}
    </div>
  );
}