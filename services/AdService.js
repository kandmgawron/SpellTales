class AdServiceClass {
  constructor() {
    this.isLoaded = false;
    this.isInitialized = false;
  }

  async initialize() {
    this.isInitialized = true;
    setTimeout(() => { this.isLoaded = true; }, 1000);
  }

  async loadAd() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isLoaded = true;
        resolve(true);
      }, 1500);
    });
  }

  async showAd(callbacks = {}) {
    if (!this.isLoaded) {
      callbacks.onError?.(new Error('Ad not loaded'));
      return false;
    }

    setTimeout(() => {
      callbacks.onRewarded?.({ amount: 1, type: 'story' });
      this.isLoaded = false;
      this.loadAd();
    }, 5000);

    return true;
  }

  isAdReady() {
    return this.isLoaded;
  }

  getBannerAdUnitId() {
    return 'test-banner-id';
  }
}

export const AdService = new AdServiceClass();
export const BannerAd = null;
export const BannerAdSize = null;
export const adMobAvailable = false;
