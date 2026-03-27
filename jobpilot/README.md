# JobPilot — React Native (Expo)

A full-featured job application tracker with Gmail integration, built with React Native + Expo.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (iOS / Android)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npx expo start

# 3. Scan the QR code with Expo Go (Android) or Camera app (iOS)
```

---

## 📁 Project Structure

```
jobpilot/
├── App.js                          # Root entry point
├── app.json                        # Expo config
├── package.json
└── src/
    ├── data/
    │   ├── theme.js                # Colors, stage constants
    │   ├── seed.js                 # Sample data
    │   └── AppContext.js           # Global state (React Context)
    ├── components/
    │   ├── UI.js                   # Reusable: Card, Btn, StagePill, Avatar, etc.
    │   ├── AddJobModal.js          # Add / Edit job modal
    │   └── ComposeModal.js         # Email compose modal
    ├── screens/
    │   ├── DashboardScreen.js      # Overview, stats, funnel, reminders
    │   ├── JobsScreen.js           # Job list + Job detail (with tabs)
    │   ├── InboxScreen.js          # Email inbox + reader
    │   ├── RemindersScreen.js      # Reminders + add reminder
    │   └── AnalyticsScreen.js      # Charts, rates, funnel
    └── navigation/
        └── Navigation.js           # Bottom tab + stack navigation
```

---

## ✨ Features

| Feature | Status |
|---|---|
| Dashboard with stats & funnel | ✅ |
| Job list with stage filters | ✅ |
| Add / Edit / Delete jobs | ✅ |
| Stage progress tracker per job | ✅ |
| Timeline events per job | ✅ |
| Email threads per job | ✅ |
| Gmail inbox (read & reply) | ✅ |
| Compose email from anywhere | ✅ |
| Reminders with follow-up email | ✅ |
| Analytics with charts | ✅ |
| Persistent state (in-memory) | ✅ |
| Dark theme | ✅ |

---

## 🔌 Gmail Integration (Backend Phase)

The compose modal is wired up and ready. To connect real Gmail:

1. Create a Google Cloud project
2. Enable Gmail API
3. Set up OAuth 2.0 credentials
4. Replace the `handleSend` stub in `ComposeModal.js` with a real API call to your backend
5. Your backend calls Gmail API with the user's OAuth token

---

## 🎨 Customization

- Colors: edit `src/data/theme.js`
- Sample data: edit `src/data/seed.js`
- Add more stages: update `STAGES` array in `src/data/theme.js`

---

## 📱 Build for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```
