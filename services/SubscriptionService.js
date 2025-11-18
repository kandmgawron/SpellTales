import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { StoreKitNative } from './StoreKitNative';

// Subscription service for App Store subscriptions
export class SubscriptionService {
  static productIds = {
    monthly: 'monthlypremium'
  };

  static premiumUsersCache = null;
  static cacheExpiry = null;
  static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static async checkSubscriptionStatus(userEmail) {
    // Development/preview build override - never active in App Store builds
    if (Constants.appOwnership === 'expo' && process.env.EXPO_PUBLIC_FORCE_PREMIUM === 'true') {
      return { isSubscribed: true, subscriptionType: 'premium', expiryDate: null };
    }

    try {
      // Use backend API for subscription status check
      const response = await fetch('https://rnbcv6rsb7.execute-api.eu-west-2.amazonaws.com/prod/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'check_subscription',
          userEmail: userEmail
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return result.subscriptionStatus;
        }
      }
    } catch (error) {
      console.error('Subscription check failed:', error);
    }

    // Default to free for production
    return { isSubscribed: false, subscriptionType: 'free', expiryDate: null };
  }

  static async isPremiumUser(userEmail) {
    // Development/preview build override - never active in App Store builds
    if (Constants.appOwnership === 'expo' && process.env.EXPO_PUBLIC_FORCE_PREMIUM === 'true') {
      return true;
    }
    
    // Production subscription check
    const status = await this.checkSubscriptionStatus(userEmail);
    return status.isSubscribed;
  }

  static async purchaseSubscription(productId) {
    if (Platform.OS !== 'ios') {
      return { success: false, error: 'iOS only feature' };
    }

    try {
      const result = await StoreKitNative.purchaseProduct(productId);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async restorePurchases() {
    if (Platform.OS !== 'ios') {
      return { success: false, error: 'iOS only feature' };
    }

    try {
      return await StoreKitNative.restorePurchases();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static getSubscriptionPlans() {
    return [
      {
        id: this.productIds.monthly,
        name: 'Premium Monthly',
        price: '£2.99',
        description: 'Unlimited stories, no ads'
      }
    ];
  }
}
