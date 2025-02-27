export default {
  expo: {
    androidStatusBar: {
      backgroundColor: "transparent",
      translucent: true,
    },
    ios: {
      infoPlist: {
        NSCameraUsageDescription: "Ứng dụng cần truy cập camera để quét mã QR.",
      },
    },
    plugins: [
      [
        "expo-barcode-scanner",
        {
          cameraPermission: "Ứng dụng cần truy cập camera để quét mã QR.",
        },
      ],
    ],
  },
};
