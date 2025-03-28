import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  StatusBar,
  Dimensions,
  Platform,
} from "react-native";
import CustomButton from "../components/common/CustomButton";
import { SafeAreaView } from "react-native-safe-area-context";

import newLogo from "../assets/icons/new-logo.png";

const { width, height } = Dimensions.get("window");

const LauncherScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Background hình ảnh */}
      <ImageBackground
        source={require("../assets/images/background.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.contentContainer}>
          {/* Logo + Tên Ứng Dụng */}
          <View style={styles.logoContainer}>
            <Image source={newLogo} style={styles.logo} resizeMode="contain" />
          </View>

          {/* Các Nút */}
          <View style={styles.buttonContainer}>
            <CustomButton
              title="Đăng nhập"
              onPress={() => navigation.navigate("Login")}
              backgroundColor={"#48A2FC"}
            />
            <CustomButton
              title="Tạo tài khoản mới"
              onPress={() => navigation.navigate("Register")}
              backgroundColor={"#D9D9D9"}
              textColor={"#2384FF"}
            />
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

export default LauncherScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    flexShrink: 1, // 🛠 Ngăn tràn màn hình
    borderColor: "red",
  },

  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 70,
    color: "#131058",
    fontWeight: "bold",
  },
  logo: {
    width: width * 0.6,
    height: width * 0.6,
  },
  buttonContainer: {
    gap: 20,
    width: "100%",
    alignItems: "center",
  },
});
