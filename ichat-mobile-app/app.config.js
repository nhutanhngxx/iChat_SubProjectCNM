export default {
  expo: {
    androidStatusBar: {
      backgroundColor: "transparent",
      translucent: true,
    },
    ios: {
      infoPlist: {
        UIStatusBarStyle: "UIStatusBarStyleDarkContent", // Hoặc "UIStatusBarStyleLightContent"
      },
    },
  },
};
