// Mock ad service - will be replaced with real AdMob in production build
class AdServiceClass {
  constructor() {
    this.isLoaded = false;
    this.isLoading = false;
    this.callbacks = {};
    this.isInitialized = false;
  }

  async initialize() {
    this.isInitialized = true;
    // Simulate loading first ad
    setTimeout(() => {
      this.isLoaded = true;
    }, 1000);
  }

  async loadAd() {
    if (!this.isInitialized || this.isLoading || this.isLoaded) return;
    
    this.isLoading = true;
    // Simulate ad loading
    setTimeout(() => {
      this.isLoaded = true;
      this.isLoading = false;
      if (this.callbacks.onLoaded) this.callbacks.onLoaded();
    }, 1000);
  }

  async showAd(callbacks = {}) {
    this.callbacks = callbacks;
    
    if (!this.isLoaded) {
      if (callbacks.onError) {
        callbacks.onError(new Error('Ad not loaded'));
      }
      return false;
    }

    // Simulate ad showing and reward after 5 seconds
    setTimeout(() => {
      if (callbacks.onRewarded) callbacks.onRewarded({ amount: 1, type: 'story' });
      this.isLoaded = false;
      // Preload next ad
      this.loadAd();
    }, 5000);

    return true;
  }

  isAdReady() {
    return this.isLoaded;
  }
}

export const AdService = new AdServiceClass();
