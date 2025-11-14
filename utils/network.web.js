// Web implementation of network detection
export const getNetworkStateAsync = async () => {
  return {
    isConnected: navigator.onLine,
    isInternetReachable: navigator.onLine,
  };
};

// Listen for online/offline events
export const addNetworkListener = (callback) => {
  const handleOnline = () => callback({ isConnected: true });
  const handleOffline = () => callback({ isConnected: false });
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};
