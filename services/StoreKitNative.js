import { NativeModules, Platform } from 'react-native';

const { StoreKitBridge } = NativeModules;

export class StoreKitNative {
  static async purchaseProduct(productId) {
    if (Platform.OS !== 'ios' || !StoreKitBridge) {
      throw new Error('StoreKit only available on iOS');
    }
    
    return await StoreKitBridge.purchaseProduct(productId);
  }
  
  static async restorePurchases() {
    if (Platform.OS !== 'ios' || !StoreKitBridge) {
      throw new Error('StoreKit only available on iOS');
    }
    
    return await StoreKitBridge.restorePurchases();
  }
  
  static async checkSubscriptionStatus() {
    if (Platform.OS !== 'ios' || !StoreKitBridge) {
      return {
        isSubscribed: false,
        subscriptionType: 'free',
        expiryDate: null
      };
    }
    
    return await StoreKitBridge.checkSubscriptionStatus();
  }
}
