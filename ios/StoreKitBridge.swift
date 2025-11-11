import StoreKit
import React

@objc(StoreKitBridge)
class StoreKitBridge: NSObject {
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  @objc
  func purchaseProduct(_ productId: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    Task {
      do {
        // 1. Request product info
        let products = try await Product.products(for: [productId])
        guard let product = products.first else {
          rejecter("PRODUCT_NOT_FOUND", "Product not found", nil)
          return
        }
        
        // 2. Present purchase sheet
        let result = try await product.purchase()
        
        // 3. Handle result
        switch result {
        case .success(let verification):
          if case .verified(let transaction) = verification {
            // Unlock subscription features
            await transaction.finish()
            resolver([
              "success": true,
              "transactionId": transaction.id,
              "productId": transaction.productID
            ])
          } else {
            rejecter("VERIFICATION_FAILED", "Transaction verification failed", nil)
          }
        case .userCancelled:
          resolver([
            "success": false,
            "error": "User cancelled"
          ])
        case .pending:
          resolver([
            "success": false,
            "error": "Purchase pending"
          ])
        @unknown default:
          rejecter("UNKNOWN_ERROR", "Unknown purchase result", nil)
        }
      } catch {
        rejecter("PURCHASE_ERROR", error.localizedDescription, error)
      }
    }
  }
  
  @objc
  func restorePurchases(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    Task {
      do {
        try await AppStore.sync()
        let currentEntitlements = await Transaction.currentEntitlements
        
        var activeSubscriptions: [[String: Any]] = []
        for await entitlement in currentEntitlements {
          if case .verified(let transaction) = entitlement {
            activeSubscriptions.append([
              "productId": transaction.productID,
              "transactionId": transaction.id,
              "purchaseDate": transaction.purchaseDate.timeIntervalSince1970
            ])
          }
        }
        
        resolver([
          "success": true,
          "subscriptions": activeSubscriptions
        ])
      } catch {
        rejecter("RESTORE_ERROR", error.localizedDescription, error)
      }
    }
  }
  
  @objc
  func checkSubscriptionStatus(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    Task {
      let currentEntitlements = await Transaction.currentEntitlements
      
      var hasActiveSubscription = false
      var expiryDate: TimeInterval? = nil
      
      for await entitlement in currentEntitlements {
        if case .verified(let transaction) = entitlement {
          hasActiveSubscription = true
          if let expiration = transaction.expirationDate {
            expiryDate = expiration.timeIntervalSince1970
          }
          break
        }
      }
      
      resolver([
        "isSubscribed": hasActiveSubscription,
        "subscriptionType": hasActiveSubscription ? "premium" : "free",
        "expiryDate": expiryDate as Any
      ])
    }
  }
}
