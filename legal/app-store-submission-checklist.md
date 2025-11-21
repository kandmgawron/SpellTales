# App Store Submission Checklist for SpellTales

## Pre-Submission Requirements

### ✅ Legal Documents (COMPLETED)
- [x] Privacy Policy created (`legal/privacy-policy.md`)
- [x] Terms of Service created (`legal/terms-of-service.md`)
- [x] Age Rating Justification created (`legal/age-rating-justification.md`)
- [ ] Host privacy policy online (required URL for App Store)
- [ ] Host terms of service online (required URL for App Store)

**Action Required**: Upload these documents to your website and get URLs

### ✅ App Configuration (COMPLETED)
- [x] app.json updated with complete metadata
- [x] Version set to 1.0.0
- [x] Bundle identifier configured
- [x] Permissions documented (Face ID, biometrics)
- [x] Description optimized for App Store
- [x] Keywords added

### ⚠️ Required Assets (YOU NEED TO CREATE)

#### App Icon (Required)
- **1024x1024px** - App Store icon (PNG, no transparency, no rounded corners)
- Location: `./assets/icon.png` (update this file)

#### Screenshots (Required - minimum 2, maximum 10)
You need screenshots for:
- **6.7" Display (iPhone 15 Pro Max)**: 1290 x 2796 pixels
- **6.5" Display (iPhone 14 Plus)**: 1284 x 2778 pixels  
- **5.5" Display (iPhone 8 Plus)**: 1242 x 2208 pixels

**Recommended Screenshots**:
1. Welcome/Home screen with story creation
2. Visual story creator with character selection
3. Generated story display
4. Profile management screen
5. Saved stories library
6. Premium features showcase

#### Optional Assets
- App Preview Video (15-30 seconds, same sizes as screenshots)
- Promotional artwork for App Store features

### ⚠️ App Store Connect Setup (YOU NEED TO DO)

#### 1. Create App Listing
- Log into App Store Connect
- Create new app
- Enter app information:
  - **Name**: SpellTales
  - **Subtitle**: AI Bedtime Stories for Kids
  - **Category**: Education (Primary), Books (Secondary)
  - **Age Rating**: 4+

#### 2. App Information
- **Privacy Policy URL**: [Your hosted URL]
- **Terms of Service URL**: [Your hosted URL]
- **Support URL**: https://katehollow.co.uk/spelltales/support (or your URL)
- **Marketing URL**: https://katehollow.co.uk/spelltales (optional)

#### 3. App Description
```
Create magical, personalized bedtime stories for your children with AI!

SpellTales generates unique stories tailored to your child's age and interests. Choose characters, settings, and learning words to create engaging tales that promote literacy and imagination.

FEATURES:
• AI-Powered Stories - Unique stories every time
• Age-Appropriate Content - Stories for ages 2-17
• Multiple Profiles - Manage stories for multiple children
• Learning Words - Integrate vocabulary building
• Story Library - Save and revisit favorite stories
• Safe Content - Advanced content filtering
• Dark Mode - Easy on the eyes for bedtime
• Offline Access - Read saved stories anywhere

SUBSCRIPTION:
• Free: All age ratings with ads
• Premium ($4.99/month): Ad-free, unlimited stories, story saving

Perfect for bedtime routines, encouraging reading, and quality family time!
```

#### 4. Keywords (100 character limit)
```
bedtime,stories,kids,children,AI,learning,reading,education,family,parenting
```

#### 5. Promotional Text (170 characters - can be updated anytime)
```
Create magical AI bedtime stories! Choose characters, add learning words, and generate unique tales for your children. Perfect for bedtime routines!
```

#### 6. What's New (for updates)
```
Welcome to SpellTales! Create personalized AI bedtime stories for your children with:
• AI-powered story generation
• Multiple child profiles
• Age-appropriate content filtering
• Learning word integration
• Story saving and management
```

### ⚠️ In-App Purchases Setup (YOU NEED TO DO)

#### Create Subscription Product
1. Go to App Store Connect → Your App → In-App Purchases
2. Create new subscription group: "SpellTales Premium"
3. Create subscription:
   - **Product ID**: `com.kategawron.spelltales.premium.monthly`
   - **Reference Name**: SpellTales Premium Monthly
   - **Duration**: 1 Month
   - **Price**: $4.99 USD (Tier 5)
   - **Subscription Display Name**: Premium Membership
   - **Description**: Unlock unlimited ad-free stories, save your favorites, and manage custom learning words.

4. Add subscription benefits:
   - Ad-free experience
   - Unlimited story generation
   - Story saving and library
   - Custom learning words
   - Multiple child profiles
   - Priority support

### ⚠️ Age Rating Configuration

**Questionnaire Answers**:
- Cartoon or Fantasy Violence: None
- Realistic Violence: None
- Sexual Content or Nudity: None
- Profanity or Crude Humor: None
- Alcohol, Tobacco, or Drug Use: None
- Mature/Suggestive Themes: None
- Horror/Fear Themes: Infrequent/Mild
- Medical/Treatment Information: None
- Gambling: None
- Unrestricted Web Access: No
- **User-Generated Content: Yes** (with moderation)

**Result**: 4+ rating

### ⚠️ Content Rights

You need to confirm:
- [x] You own all content in the app
- [x] You have rights to use AWS Bedrock for AI generation
- [x] You have rights to use all emojis and assets
- [x] You comply with all third-party licenses

### ⚠️ Export Compliance

For App Store submission:
- **Uses Encryption**: Yes (HTTPS, AWS Cognito)
- **Qualifies for Exemption**: Yes (standard encryption)
- **CCATS Required**: No

## Build and Submit Process

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login to Expo
```bash
eas login
```

### 3. Configure Build
```bash
eas build:configure
```

### 4. Create Production Build
```bash
eas build --platform ios --profile production
```

### 5. Submit to App Store
```bash
eas submit --platform ios
```

## Testing Before Submission

### Required Testing
- [ ] Test on real iPhone (not simulator)
- [ ] Test all user flows (signup, login, story creation)
- [ ] Test subscription flow (sandbox mode)
- [ ] Test biometric authentication
- [ ] Test offline mode
- [ ] Test content filters with inappropriate inputs
- [ ] Test all age ratings
- [ ] Test profile management
- [ ] Test story saving and deletion
- [ ] Test password reset flow

### TestFlight Beta Testing
1. Submit build to TestFlight
2. Add internal testers (up to 100)
3. Test for 1-2 weeks
4. Fix any critical bugs
5. Submit to App Review

## App Review Notes

**Notes for Reviewer**:
```
SpellTales is a children's storytelling app with strong parental controls and content filtering.

TEST ACCOUNT:
Email: reviewer@spelltales.test
Password: [Provide a test password]

TESTING INSTRUCTIONS:
1. Sign in with test account
2. Create a child profile (any name, any age)
3. Generate a story using the visual creator or manual input
4. Test content filtering by attempting inappropriate keywords (will be blocked)
5. Review saved stories in the library
6. Test subscription flow (sandbox mode)

CONTENT SAFETY:
All stories pass through AWS Bedrock Guardrails for content filtering. Inappropriate requests are automatically blocked. Parents can review all stories before sharing with children.

SUBSCRIPTION:
Premium subscription ($4.99/month) is configured in sandbox mode for testing. Real subscriptions will be processed through Apple's StoreKit.
```

## Post-Submission

### If Approved
- [ ] Announce launch
- [ ] Monitor crash reports
- [ ] Respond to user reviews
- [ ] Plan updates

### If Rejected
- Review rejection reason carefully
- Make required changes
- Respond to App Review team
- Resubmit

## Timeline Estimate

- Build creation: 30-60 minutes
- App Store Connect setup: 2-4 hours
- Screenshot creation: 2-3 hours
- Initial review: 24-48 hours (can be longer)
- TestFlight availability: Immediate after approval
- App Store release: After final approval

## Support Resources

- **Expo Documentation**: https://docs.expo.dev
- **App Store Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **EAS Submit**: https://docs.expo.dev/submit/introduction/

---

**Next Steps**:
1. Host privacy policy and terms online
2. Create app icon and screenshots
3. Set up App Store Connect listing
4. Configure in-app purchase
5. Create production build with EAS
6. Submit to TestFlight
7. Test thoroughly
8. Submit for App Review
