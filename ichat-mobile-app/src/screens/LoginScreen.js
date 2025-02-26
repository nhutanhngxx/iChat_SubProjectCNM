import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  TextInput,
  Alert,
} from "react-native";
import axios from "axios";
import CustomButton from "../components/common/CustomButton";

const LoginScreen = ({ navigation, setUser }) => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.get(
        "https://67b7e3ed2bddacfb27104090.mockapi.io/ichat/user"
      );

      const users = response.data; // Lấy danh sách user từ API
      const user = users.find(
        (u) => u.phone === phone && u.password === password
      );

      if (user) {
        setUser(user); // Lưu thông tin user sau khi đăng nhập thành công
        Alert.alert("Đăng nhập thành công!", `Chào mừng ${user.full_name}`);
      } else {
        Alert.alert("Lỗi", "Số điện thoại hoặc mật khẩu không đúng!");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể kết nối đến máy chủ, vui lòng thử lại!");
    }
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
              <Text style={styles.label}>Đăng nhập</Text>
              <TextInput
                style={styles.input}
                placeholder="Số điện thoại"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <Text
                onPress={() => alert("Quên mật khẩu?")}
                style={styles.forgotPassword}
              >
                Quên mật khẩu?
              </Text>
            </View>
          </View>
          <View style={{ gap: 20 }}>
            <CustomButton
              title="Đăng nhập"
              onPress={handleLogin}
              backgroundColor={"#48A2FC"}
            />
          </View>
        </View>

        <View style={{ position: "absolute", bottom: 20, alignSelf: "center" }}>
          <Text
            style={styles.question}
            onPress={() => alert("Những câu hỏi thường gặp")}
          >
            Những câu hỏi thường gặp
          </Text>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

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
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    height: 350,
  },
  label: {
    fontWeight: "bold",
    fontSize: 30,
    marginBottom: 40,
  },
  input: {
    width: 300,
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#D9D9D9",
  },
  forgotPassword: {
    fontWeight: "bold",
    color: "#0C098C",
    fontSize: 16,
    alignSelf: "flex-start",
    marginLeft: 20,
  },
  title: {
    fontSize: 70,
    color: "#131058",
    fontWeight: "bold",
  },
  question: {
    fontWeight: "400",
    fontSize: 16,
    textAlign: "center",
  },
});

export default LoginScreen;
