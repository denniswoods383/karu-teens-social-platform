// Auto-detect current IP address
export const getCurrentIP = (): string => {
  if (typeof window !== 'undefined') {
    // Get current hostname from browser
    const hostname = window.location.hostname;
    
    // If accessing via IP, use that IP
    if (hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      return hostname;
    }
    
    // Use whatever hostname we're on
    return hostname;
  }
  
  return window?.location?.hostname || 'your-domain.com';
};

export const getAPIBaseURL = (): string => {
  const hostname = getCurrentIP();
  return `https://${hostname}/api`;
};

export const getWebSocketURL = (): string => {
  const hostname = getCurrentIP();
  return `wss://${hostname}/ws`;
};