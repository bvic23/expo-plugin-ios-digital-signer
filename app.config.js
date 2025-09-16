export default {
  expo: {
    name: "SignDemog",
    slug: "signdemog",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.anonymous.SignDemog"
    },
    android: {
      package: "com.anonymous.SignDemog"
    },
    scheme: "signdemog",
    plugins: [
      "expo-router"
    ]
  }
};
