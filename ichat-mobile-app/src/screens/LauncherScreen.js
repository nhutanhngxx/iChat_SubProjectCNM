import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Platform,
} from "react-native";
import CustomButton from "../components/common/CustomButton";

// Lấy kích thước màn hình
const { width } = Dimensions.get("window");

const LauncherScreen = ({ navigation }) => {
  useEffect(() => {
    if (Platform.OS === "ios") {
      StatusBar.setBarStyle("dark-content"); // Hoặc "light-content" nếu cần
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* StatusBar setup */}
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <ImageBackground
        source={require("../assets/images/background.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.contentContainer}>
            {/* Logo + Tên Ứng Dụng */}
            <View style={styles.logoContainer}>
              <Text style={styles.title}>iChat</Text>
              <Image
                source={require("../assets/images/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
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
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

export default LauncherScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
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
    width: width * 0.9, // Logo sẽ chiếm 80% chiều rộng màn hình
    height: width * 0.9, // Giữ tỷ lệ phù hợp
  },
  buttonContainer: {
    gap: 20,
    width: "100%",
    alignItems: "center",
  },
});
