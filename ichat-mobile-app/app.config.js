export default {
  expo: {
    name: "iChat",
    slug: "snack-a8e50932-4793-425a-859b-e124996f0590",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icons/new-logo.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/icons/new-logo.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSCameraUsageDescription:
          "Ứng dụng cần quyền truy cập camera để quét mã QR.",
      },
    },
    android: {
      permissions: ["CAMERA"],
      adaptiveIcon: {
        foregroundImage: "./assets/icons/new-logo.png",
        backgroundColor: "#ffffff",
      },
      package: "com.anonymous.snacka8e509324793425a859be124996f0590",
    },
    web: {
      favicon: "./assets/icons/new-logo.png",
    },
    updates: {
      enabled: true,
      checkAutomatically: "onError",
      fallbackToCacheTimeout: 0,
    },
    packagerOpts: {
      dev: true,
      hostType: "localhost",
    },
    host: "exp.host",
    experimental: {
      bridgeless: false,
    },
    plugins: [
      [
        "expo-image-picker",
        {
          photosPermission: "Ứng dụng cần truy cập thư viện ảnh để chọn ảnh.",
        },
      ],
      "expo-barcode-scanner",
    ],
    extra: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID,
    },
  },
};
