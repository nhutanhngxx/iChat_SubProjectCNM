import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import CustomButton from "../components/common/CustomButton";
import { UserContext } from "../config/context/UserContext";
import authService from "../services/authService";
import { IconButton } from "react-native-paper";

const LoginScreen = ({ navigation }) => {
  const { setUser } = useContext(UserContext);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(true);

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập số điện thoại và mật khẩu!");
      return;
    }
    setLoading(true);
    try {
      const response = await authService.login({ phone, password });
      const { user } = response;
      if (user) {
        setUser(user);
        Alert.alert("Đăng nhập thành công!", `Chào mừng ${user?.full_name}`);
      } else {
        Alert.alert("Thông báo", "Sai số điện thoại hoặc mật khẩu!");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response?.status === 401) {
        Alert.alert("Thông báo", "Số điện thoại hoặc mật khẩu không đúng!");
      } else {
        const errorMessage =
          error.response?.data?.message || "Có lỗi xảy ra! Vui lòng thử lại.";
        Alert.alert("Lỗi", errorMessage);
      }
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

              <View style={styles.phoneContainer}>
                <View style={styles.prefixContainer}>
                  <Text style={styles.prefixText}>+84</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Nhập số điện thoại"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  maxLength={10} // không tính +84
                />
              </View>
              <View
                style={{
                  position: "relative",
                  width: "100%",
                }}
              >
                <TextInput
                  style={styles.input}
                  placeholder="Nhập mật khẩu..."
                  secureTextEntry={isPasswordVisible}
                  value={password}
                  onChangeText={setPassword}
                />
                <IconButton
                  icon={isPasswordVisible ? "eye" : "eye-off"}
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  style={{ position: "absolute", right: 5, top: 5 }}
                  size={20}
                />
              </View>

              <Text
                onPress={() => navigation.navigate("ForgotPassword")}
                style={styles.forgotPassword}
              >
                Quên mật khẩu?
              </Text>

              <CustomButton
                title="Đăng nhập"
                onPress={handleLogin}
                backgroundColor={"#48A2FC"}
              />
              <Text style={styles.registerText}>
                Bạn chưa có tài khoản?{" "}
                <Text
                  style={styles.register}
                  onPress={() => navigation.navigate("Register")}
                >
                  Đăng ký ngay
                </Text>
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
    flex: 1,
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
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: 0,
    borderBottomWidth: 1,
    borderBottomColor: "gray",
    fontSize: 18,
  },
  forgotPassword: {
    fontWeight: "bold",
    color: "#0C098C",
    fontSize: 14,
    alignSelf: "flex-end",
    marginRight: 10,
    marginVertical: 20,
    opacity: 0.5,
  },
  registerText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
    position: "absolute",
    bottom: 30,
  },
  register: {
    color: "#0C098C",
    fontWeight: "bold",
    opacity: 0.5,
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "gray",
    marginBottom: 10,
    height: 50,
  },
  prefixContainer: {
    paddingHorizontal: 10,
  },
  prefixText: {
    fontSize: 18,
  },
  phoneInput: {
    flex: 1,
    fontSize: 18,
  },
});

export default LoginScreen;
