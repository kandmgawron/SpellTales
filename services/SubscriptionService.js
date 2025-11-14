import { Platform } from 'react-native';
import { StoreKitNative } from './StoreKitNative';

// Subscription service for App Store subscriptions
export class SubscriptionService {
  static productIds = {
    monthly: 'com.bedtimestories.premium.monthly'
  };

  static premiumUsersCache = null;
  static cacheExpiry = null;
  static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static async getPremiumUsers() {
    // Check cache first
    if (this.premiumUsersCache && this.cacheExpiry && Date.now() < this.cacheExpiry) {
      return this.premiumUsersCache;
    }

    try {
      // Simple fetch to AWS Secrets Manager (requires IAM permissions)
      const response = await fetch(`https://secretsmanager.eu-west-2.amazonaws.com/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target': 'secretsmanager.GetSecretValue'
        },
        body: JSON.stringify({
          SecretId: 'bedtime-stories-premium-users'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const premiumUsers = JSON.parse(data.SecretString);
        
        // Cache the result
        this.premiumUsersCache = premiumUsers;
        this.cacheExpiry = Date.now() + this.CACHE_DURATION;
        
        return premiumUsers;
      }
    } catch (error) {
    }

    // Fallback to hardcoded list if secret fetch fails
    return [
      'kandmgawron@gmail.com',
      'kate@kategawron.com', 
      'kategawron@gmail.com'
    ];
  }

  static async checkSubscriptionStatus(userEmail) {
    // Check test premium users from Secrets Manager
    const testPremiumUsers = await this.getPremiumUsers();

    if (testPremiumUsers.includes(userEmail)) {
      return {
        isSubscribed: true,
        subscriptionType: 'premium',
        expiryDate: null
      };
    }

    if (Platform.OS !== 'ios') {
      return { isSubscribed: false, subscriptionType: 'free', expiryDate: null };
    }

    try {
      return await StoreKitNative.checkSubscriptionStatus();
    } catch (error) {
      return { isSubscribed: false, subscriptionType: 'free', expiryDate: null };
    }
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
        price: '$4.99',
        description: 'Unlimited stories, no ads'
      }
    ];
  }
}
