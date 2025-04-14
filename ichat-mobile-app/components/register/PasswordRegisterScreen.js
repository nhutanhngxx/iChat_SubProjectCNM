import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  TextInput,
  Alert,
  Modal,
  Platform,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
} from "react-native";
import CustomButton from "../common/CustomButton";
import { Icon, IconButton } from "react-native-paper";
import { ActivityIndicator } from "react-native";
import { Appbar } from "react-native-paper";

const PasswordRegisterScreen = ({ navigation, route }) => {
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(true);
  const [isRePasswordVisible, setIsRePasswordVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { phone, tempToken } = route.params;

  // Tạo và mật khẩu cho tài khoản; sau đó chuyển sang màn hình nhập thông tin cá nhân
  const handleCreatePassword = () => {
    setIsLoading(true);
    try {
      // Mật khẩu có chứa ít nhất 1 chữ cái và 1 số, độ dài từ 8 ký tự trở lên
      const regex =
        /^(?=.*[a-z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]{8,}$/;

      // Kiểm tra mật khẩu không được để trống
      if (password === "") {
        Alert.alert("Mật khẩu không được để trống", "Vui lòng nhập mật khẩu");
        setError("Mật khẩu không được để trống");
        return;
      }

      // Kiểm tra mật khẩu có hợp lệ không
      if (!regex.test(password)) {
        Alert.alert(
          "Mật khẩu không hợp lệ",
          "Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số, độ dài từ 8 ký tự trở lên"
        );
        setError(
          "Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số, độ dài từ 8 ký tự trở lên"
        );
        return;
      }

      // Kiểm tra mật khẩu nhập lại có khớp không
      if (password !== rePassword) {
        Alert.alert("Mật khẩu không khớp", "Vui lòng nhập lại mật khẩu");
        setError("Mật khẩu không khớp");
        return;
      }

      setError("");

      navigation.navigate("InfoRegister", { password, phone, tempToken });
    } catch (error) {
      console.error("Unexpected error during creating password:", error);
      Alert.alert(
        "Lỗi",
        "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ImageBackground
          source={require("../../assets/images/background.png")}
          style={styles.background}
        >
          <View style={styles.container}>
            <TouchableOpacity
              style={{ flexDirection: "row", gap: 5, alignItems: "center" }}
              onPress={() => navigation.goBack()}
            >
              <Image
                source={require("../../assets/icons/go-back.png")}
                style={{ width: 20, height: 20 }}
              />
              <Text style={{ color: "#48A2FC" }}>Quay lại</Text>
            </TouchableOpacity>

            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={styles.label}>Đăng ký tài khoản</Text>
              <Text style={{ fontSize: 10, opacity: 0.5, marginBottom: 40 }}>
                Tạo tài khoản mới
              </Text>
              {/* Nhập mật khẩu */}
              <View style={styles.item}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    marginLeft: 15,
                  }}
                >
                  Nhập mật khẩu
                </Text>
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
                  style={{ position: "absolute", right: 5, top: 28 }}
                  size={20}
                />
              </View>

              {/* Nhập lại mật khẩu */}
              <View style={styles.item}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    marginLeft: 15,
                  }}
                >
                  Nhập lại mật khẩu
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập lại mật khẩu..."
                  secureTextEntry={isRePasswordVisible}
                  value={rePassword}
                  onChangeText={setRePassword}
                />
                <IconButton
                  icon={isRePasswordVisible ? "eye" : "eye-off"}
                  onPress={() => setIsRePasswordVisible(!isRePasswordVisible)}
                  style={{ position: "absolute", right: 5, top: 28 }}
                  size={20}
                />
              </View>

              <View style={{ width: 300, height: 50 }}>
                <Text style={styles.error}>{error}</Text>
              </View>

              <View style={{ gap: 20 }}>
                {isLoading ? (
                  <ActivityIndicator size="large" color="#48A2FC" /> // Hiển thị spinner khi loading
                ) : (
                  <CustomButton
                    title="Tiếp theo"
                    onPress={handleCreatePassword}
                    // onPress={() => navigation.navigate("InfoRegister", { phone })}
                    backgroundColor={"#48A2FC"}
                  />
                )}
              </View>
            </View>

            <View style={{ marginTop: 30 }}>
              <Text
                style={styles.question}
                onPress={() => Alert.alert("Những câu hỏi thường gặp")}
              >
                Những câu hỏi thường gặp
              </Text>
            </View>
          </View>

          {/* </View> */}
        </ImageBackground>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  label: {
    fontWeight: "bold",
    fontSize: 30,
    marginBottom: 10,
  },
  error: {
    color: "red",
    marginBottom: 15,
    fontSize: 14,
    fontWeight: "400",
  },
  input: {
    width: 300,
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "white",
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
  item: {
    alignItems: "left",
    gap: 5,
    position: "relative",
  },
});

export default PasswordRegisterScreen;
