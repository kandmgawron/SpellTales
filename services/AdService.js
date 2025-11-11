class AdServiceClass {
  constructor() {
    this.isLoaded = false;
    this.isInitialized = false;
  }

  async initialize() {
    this.isInitialized = true;
    setTimeout(() => { this.isLoaded = true; }, 1000);
  }

  async showAd(callbacks = {}) {
    if (!this.isLoaded) {
      callbacks.onError?.(new Error('Ad not loaded'));
      return false;
    }

    setTimeout(() => {
      callbacks.onRewarded?.({ amount: 1, type: 'story' });
      this.isLoaded = false;
      setTimeout(() => { this.isLoaded = true; }, 1000);
    }, 5000);

    return true;
  }

  isAdReady() {
    return this.isLoaded;
  }
}

export const AdService = new AdServiceClass();
