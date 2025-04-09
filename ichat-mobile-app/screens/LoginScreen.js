import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import CustomButton from "../components/common/CustomButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "../context/UserContext";

const LoginScreen = ({ navigation }) => {
  const { setUser } = useContext(UserContext);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const API_iChat = "http://172.20.64.6:5001";

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại và mật khẩu!");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_iChat}/login`, {
        phone,
        password,
      });
      const { accessToken, user } = response.data;
      await AsyncStorage.setItem("token", accessToken);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      Alert.alert("Đăng nhập thành công!", `Chào mừng ${user.full_name}`);
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra! Vui lòng thử lại.";
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          <ImageBackground
            source={require("../assets/images/background.png")}
            style={styles.background}
          >
            <View style={styles.container}>
              <Text style={styles.label}>Đăng nhập</Text>
              <Text style={styles.description}>
                Vui lòng nhập số điện thoại và mật khẩu để đăng nhập
              </Text>

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

              <CustomButton
                title="Đăng nhập"
                onPress={handleLogin}
                backgroundColor={"#48A2FC"}
              />
              <Text
                style={styles.registerText}
                onPress={() => navigation.navigate("Register")}
              >
                Bạn chưa có tài khoản?{" "}
                <Text style={styles.register}>Đăng ký</Text>
              </Text>
            </View>
          </ImageBackground>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  label: {
    fontWeight: "bold",
    fontSize: 30,
    marginBottom: 10,
  },
  description: {
    fontSize: 12,
    marginBottom: 20,
    opacity: 0.6,
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: 0,
    borderBottomWidth: 1,
    borderBottomColor: "gray",
  },
  forgotPassword: {
    fontWeight: "bold",
    color: "#0C098C",
    fontSize: 14,
    alignSelf: "flex-end",
    marginRight: 10,
    marginBottom: 20,
  },
  registerText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
  register: {
    color: "#0C098C",
    fontWeight: "bold",
  },
});

export default LoginScreen;
