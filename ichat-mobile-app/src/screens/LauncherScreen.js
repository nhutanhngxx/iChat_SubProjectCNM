import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  Image,
} from "react-native";
import CustomButton from "../components/common/CustomButton";

const LauncherScreen = ({ navigation }) => {
  const handleLogin = () => {
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground
        source={require("../assets/images/background.png")}
        style={styles.background}
      >
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Text style={styles.title}>iChat</Text>
            <View style={styles.content}>
              <Image
                source={require("../assets/images/logo.png")}
                style={{ height: 350, width: 500 }}
              />
            </View>
          </View>
          <View style={{ gap: 20 }}>
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
    </SafeAreaView>
  );
};

export default LauncherScreen;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
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
});
