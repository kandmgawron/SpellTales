# SpellTales - AI-Powered Story Generator

SpellTales is a React Native mobile app and web application that generates personalized bedtime stories using AWS Bedrock AI, with built-in spelling word integration and age-appropriate content filtering.

## Features

### 🎭 Story Generation
- **AI-Powered Stories**: Uses Amazon Nova Lite model via AWS Bedrock
- **Age-Appropriate Content**: Separate content filters for toddlers, children, young teens, and teens
- **Custom Characters**: Users choose two characters for their story
- **Genre Selection**: Adventure, fairy-tale, mystery, friendship, magic, and more
- **Dynamic Themes**: Stories adapt based on selected keywords and themes

### 📚 Educational Features
- **Spelling Words Integration**: Include custom spelling words naturally in stories
- **AI-Generated Definitions**: Age-appropriate word definitions using separate Lambda function
- **Word Management**: Save and manage personal spelling word lists
- **Learning Profiles**: Multiple child profiles with individual age ratings and word lists

### 🎨 User Experience
- **Visual Story Creator**: Interactive character and theme selection
- **Dark/Light Mode**: Toggle between themes
- **Dynamic Loading Messages**: Genre-specific loading text with emojis
- **Story History**: Save and reload previous stories
- **Cross-Platform**: React Native mobile app + web version

### 🔐 Security & Access
- **AWS Cognito Authentication**: Secure user accounts
- **Guest Mode**: Limited access for unauthenticated users
- **Age-Specific Guardrails**: Content filtering based on user age
- **Premium Features**: Subscription-based access to advanced features

## Architecture

### Frontend
- **React Native**: Cross-platform mobile app using Expo
- **Web App**: HTML/CSS/JavaScript version served via CloudFront
- **State Management**: React hooks for local state
- **Storage**: SecureStore for offline data, DynamoDB for cloud sync

### Backend (AWS)
- **AWS Bedrock**: AI story generation with Nova Lite model
- **AWS Lambda**: 
  - `bedtime-stories`: Main story generation and user management
  - `word-definitions`: Age-appropriate word definitions
- **Amazon DynamoDB**: 
  - `bedtime-stories`: Story history and metadata
  - `user-words`: User's custom spelling words
- **AWS Cognito**: User authentication and management
- **API Gateway**: RESTful API endpoints
- **CloudFront**: Web app distribution

### Content Safety
- **Bedrock Guardrails**: 
  - Children guardrail (`jvl2snnlmz2s`): Strict content filtering
  - Teen guardrail (`e8ruua7n0tzt`): More permissive for older users
- **Age-Appropriate Prompts**: Separate Bedrock prompts for each age group
- **Input Validation**: Sanitization of user inputs

## Setup

### Prerequisites
- Node.js 18+
- Expo CLI
- AWS CLI configured
- AWS account with appropriate permissions

### Environment Variables
Create `.env` file:
```
EXPO_PUBLIC_API_BASE_URL=https://your-api-gateway-url.amazonaws.com/prod
EXPO_PUBLIC_LAMBDA_URL=https://your-lambda-url.lambda-url.region.on.aws
EXPO_PUBLIC_COGNITO_CLIENT_ID=your-cognito-client-id
EXPO_PUBLIC_COGNITO_REGION=your-aws-region
```

### Installation
```bash
cd SpellTales
npm install
npx expo start
```

### AWS Resources Setup
1. **Bedrock Prompts**: Create age-specific story prompts
2. **Lambda Functions**: Deploy story generation and word definitions functions
3. **DynamoDB Tables**: Create `bedtime-stories` and `user-words` tables
4. **Cognito User Pool**: Set up authentication
5. **API Gateway**: Configure REST API endpoints
6. **IAM Roles**: Set up Lambda execution roles with proper permissions

## Usage

### Mobile App
1. **Authentication**: Sign up/sign in or use guest mode
2. **Profile Setup**: Create child profiles with age ratings
3. **Word Management**: Add custom spelling words (authenticated users only)
4. **Story Creation**: 
   - Choose characters and themes manually
   - Use visual creator for guided selection
5. **Story Management**: Save, view, and reload previous stories

### Web App
- Access at CloudFront URL
- Simplified interface for story generation
- No authentication required
- Includes spelling words and definitions

## API Endpoints

### Story Generation
```
POST /generate-story
{
  "genre": "adventure",
  "character1": "cat",
  "character2": "dog", 
  "keyword1": "friendship",
  "ageRating": "children",
  "spellingWords": ["cat", "dog", "happy"],
  "userEmail": "user@example.com"
}
```

### Word Management
```
POST /lambda-url
{
  "action": "get_user_words",
  "userEmail": "user@example.com"
}

POST /lambda-url
{
  "action": "update_user_words",
  "userEmail": "user@example.com",
  "words": ["word1", "word2", "word3"]
}
```

### Story Management
```
POST /lambda-url
{
  "action": "get_user_stories",
  "userEmail": "user@example.com"
}
```

## File Structure

```
SpellTales/
├── App.js                 # Main application component
├── AuthScreen.js          # Authentication interface
├── ManageWordsScreen.js   # Spelling words management
├── SavedStoriesScreen.js  # Story history and management
├── AgeRatingScreen.js     # Age rating selection
├── ProfileScreen.js       # Child profile management
├── config.js              # API configuration
├── components/
│   ├── LoadingScreen.js   # Dynamic loading messages
│   ├── MenuDropdown.js    # Navigation menu
│   ├── StoryDisplayScreen.js # Story viewing interface
│   └── VisualStoryCreator.js # Interactive story creation
├── services/
│   └── SubscriptionService.js # Premium subscription handling
└── utils/
    ├── security.js        # Input validation and security
    └── rateLimiter.js     # API rate limiting
```

## Key Features Implementation

### Age-Appropriate Content
- Different Bedrock prompts for each age group
- Separate guardrails with varying content restrictions
- Age-based genre filtering

### Spelling Words Integration
- Words naturally incorporated into story narrative
- AI-generated age-appropriate definitions
- Modular definitions service for scalability

### Hybrid Storage
- DynamoDB for cloud sync and unlimited storage
- SecureStore for offline access and backup
- Automatic fallback between storage methods

### Premium Features
- Multiple child profiles
- Advanced word management
- Visual story creator
- Ad-free experience

## Development Notes

### Recent Updates
- Implemented modular word definitions system
- Added age-specific content guardrails
- Enhanced visual story creator with genre mapping
- Improved CORS handling for web app
- Added hybrid cloud/local storage system

### Known Limitations
- SecureStore 2048 byte limit for offline stories
- Rate limiting on story generation
- Guest users have limited features

## Deployment

### Mobile App
- Build with Expo EAS Build
- Deploy to App Store/Google Play

### Web App
- Upload to S3 bucket
- Serve via CloudFront distribution
- Automatic HTTPS and global CDN

## Support

For issues or feature requests, check the app's built-in support section or FAQ.
