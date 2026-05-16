module.exports = {
  "expo": {
    "name": "Local Qwen2-VL",
    "slug": "ai",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#121212"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.kouto.qwenai",
      "jsEngine": "hermes"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#121212"
      },
      "package": "com.yourname.localqwen",
      "jsEngine": "hermes"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      [
        "llama.rn",
        {}
      ],
      [
        "expo-document-picker",
        {}
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "The app needs access to your photos to analyze them with AI."
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "5e569a84-7170-4050-ae55-536ad0ef5eb7"
      }
    }
  }
}
