# Summer Vibes - Ultimate Bucket List Tracker 🌞

**Student Name:** Sherren Jielita  
**Email:** sherrenjielita@brandeis.edu  
**Course:** CS153A - Mobile App Development  
**Video Demo:** 

## App Overview

Summer Vibes is a feature-rich React Native app that helps users create, track, and document their summer adventures. Unlike a simple to-do list, this app integrates multiple phone features to create an immersive experience for capturing and reliving summer memories.

## Key Features ✨

### 1. **Multi-Screen Navigation**
- **Home/Bucket List**: Main screen for managing activities
- **Activity Details**: Detailed view with photos, location, and notes
- **Memories Gallery**: Photo gallery of completed adventures
- **Stats Dashboard**: Progress tracking and achievements
- **Profile/Settings**: User preferences and data management

### 2. **Phone Features Integration** 📱
- **Camera**: Take photos or choose from gallery for each activity
- **Location Services**: Track and save GPS coordinates for activities
- **AsyncStorage**: Persistent local storage for all data
- **Push Notifications**: Reminders for activities (optional)

### 3. **Advanced Functionality** 🚀
- **Categories**: Organize activities by type (Adventure, Beach, Food, Travel, Fun, Other)
- **Progress Tracking**: Visual progress bars and completion percentages
- **Photo Memories**: Capture and store photos for each completed activity
- **Location Mapping**: View activity locations on interactive maps
- **Statistics & Charts**: Visual representations of progress
- **Achievements System**: Unlock achievements based on activity completion
- **Data Export**: Export bucket list data

## Technical Requirements Met ✅

1. **Catchy Name**: "Summer Vibes" ☀️
2. **Interesting Functionality**: Beyond a simple to-do list - includes photo memories, location tracking, achievements, and statistics
3. **Runs on Phone**: Fully compatible with iOS and Android via Expo
4. **Phone Features Used**:
   - Camera (via expo-image-picker)
   - Location/GPS (via expo-location)
   - Local Storage (via AsyncStorage)
   - Maps (via react-native-maps)
   - Notifications (via expo-notifications)
5. **Multiple Screens**: 5 main screens with navigation
6. **TextInput Components**: Used for adding activities and notes
7. **Local Storage**: All data persisted with AsyncStorage

## Setup Instructions 🛠️

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Install Expo CLI** (if not already installed):
   ```bash
   npm install -g expo-cli
   ```

3. **Start the App**:
   ```bash
   expo start
   ```

4. **Run on Device**:
   - Install Expo Go app on your phone
   - Scan the QR code from the terminal
   - Or use iOS/Android simulator

## File Structure 📁

```
summer-vibes-bucket-list/
├── App.js                    # Main app with navigation setup
├── screens/
│   ├── BucketListScreen.js   # Main bucket list view
│   ├── ActivityDetailsScreen.js # Detailed activity view
│   ├── MemoriesScreen.js     # Photo gallery
│   ├── StatsScreen.js        # Statistics and achievements
│   └── ProfileScreen.js      # Settings and user profile
├── package.json              # Dependencies
└── README.md                 # This file
```

## How to Use the App 📱

1. **Add Activities**: 
   - Select a category
   - Type your summer activity
   - Tap the Add button

2. **Track Progress**:
   - Check off completed activities
   - View progress percentage

3. **Add Memories**:
   - Tap on any activity to open details
   - Add photos from camera or gallery
   - Save location and notes

4. **View Statistics**:
   - Check your progress in the Stats tab
   - Unlock achievements
   - View category distribution

5. **Browse Memories**:
   - Visit the Memories tab to see all photos
   - Tap photos to view full details

## Permissions Required 🔐

The app will request the following permissions:
- **Camera**: For taking photos
- **Photo Library**: For selecting existing photos
- **Location**: For saving activity locations
- **Notifications**: For activity reminders (optional)

## Data Privacy 🔒

All data is stored locally on your device using AsyncStorage. No data is sent to external servers.

## Future Enhancements 🚀

- Social sharing features
- Weather integration
- Collaborative bucket lists
- Cloud backup
- Activity suggestions based on location

## Credits 👏

Created with ❤️ by Sherren for CS153A - Summer 2025