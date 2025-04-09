import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { CheckBox } from "@rneui/themed";
import CustomButton from "../common/CustomButton";
import authService from "../../services/authService";
import { useNavigation } from "@react-navigation/native";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { firebaseConfig } from "../../config/firebase";
import { ActivityIndicator } from "react-native";

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [isChecked, setChecked] = useState(false);
  const [isCheckedSocial, setCheckedSocial] = useState(false);
  const [phone, setPhone] = useState("");
  const recaptchaVerifier = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneRegister = async (phone) => {
    if (!phone) {
      Alert.alert("Thông báo", "Vui lòng điền đầy đủ thông tin!");
      return;
    }
    if (!isChecked || !isCheckedSocial) {
      Alert.alert("Thông báo", "Vui lòng đọc và đồng ý với điều khoản!");
      return;
    }
    setIsLoading(true);
    try {
      const result = await authService.sendOTP(phone, recaptchaVerifier);

      if (result.status === "ok")
        navigation.navigate("EnterOTP", {
          phone: result.phoneNumber,
          verificationId: result.verificationId,
        });
      else {
        Alert.alert("Thông báo", result.message);
        return;
      }
    } catch (error) {
      console.error("Unexpected error during OTP verification:", error);
      Alert.alert(
        "Thông báo",
        "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginWithFacebook = () => {
    alert("Login with Facebook");
  };

  const handleLoginWithGoogle = () => {
    alert("Login with Facebook");
  };

  const handleLogin = () => {
    navigation.navigate("Login");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ flex: 1 }}>
        <ImageBackground
          source={require("../../assets/images/background.png")}
          style={styles.background}
        >
          <FirebaseRecaptchaVerifierModal
            ref={recaptchaVerifier}
            firebaseConfig={firebaseConfig}
            attemptInvisibleVerification={true}
          />

          <View style={styles.content}>
            <Text style={styles.label}>Tạo tài khoản mới</Text>
            <Text style={{ fontSize: 10, opacity: 0.5, marginBottom: 40 }}>
              Tạo tài khoản mới
            </Text>
            {/* Input phone number */}
            <View style={styles.phoneInput}>
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>+84</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Số điện thoại"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            {/* Checkbox terms */}
            <View style={{ marginBottom: 20, width: 300 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <CheckBox
                  checked={isChecked}
                  onPress={() => setChecked(!isChecked)}
                  title="Tôi đồng ý với các điều khoản của iChat"
                  containerStyle={{ backgroundColor: "transparent" }}
                  textStyle={{ fontSize: 13 }}
                />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <CheckBox
                  checked={isCheckedSocial}
                  onPress={() => setCheckedSocial(!isCheckedSocial)}
                  containerStyle={{ backgroundColor: "transparent" }}
                  title="Tôi đồng ý với điều khoản Mạng xã hội của iChat"
                  textStyle={{ fontSize: 13, flexWrap: "wrap" }}
                />
              </View>
            </View>

            {/* Button continue */}
            {isLoading ? (
              <ActivityIndicator size="large" color="#48A2FC" /> // Hiển thị spinner khi loading
            ) : (
              <CustomButton
                title="Xác nhận"
                onPress={() => handlePhoneRegister(phone)}
                backgroundColor={"#48A2FC"}
              />
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            {/* Other way to login */}
            <View style={styles.otherLogin}>
              <View style={styles.dividerContainer}>
                <View style={styles.line} />
                <Text style={{ marginHorizontal: 20 }}>hoặc</Text>
                <View style={styles.line} />
              </View>
            </View>

            <View style={styles.buttonLoginContainer}>
              {/* Login with Google */}
              <TouchableOpacity
                style={styles.buttonLogin}
                onPress={handleLoginWithFacebook}
              >
                <Image
                  source={require("../../assets/icons/facebook.png")}
                  style={{ width: 20, height: 20 }}
                />
                <Text style={styles.textButtonLogin}>Facebook</Text>
              </TouchableOpacity>
              {/* Login with Google */}
              <TouchableOpacity
                style={styles.buttonLogin}
                onPress={handleLoginWithGoogle}
              >
                <Image
                  source={require("../../assets/icons/google.png")}
                  style={{ width: 20, height: 20 }}
                />
                <Text style={styles.textButtonLogin}>Google</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.question}>
              Bạn đã có tài khoản?{" "}
              <Text
                style={[
                  styles.question,
                  { color: "#0C098C", fontWeight: "bold" },
                ]}
                onPress={() => handleLogin()}
              >
                Đăng nhập ngay
              </Text>
            </Text>
          </View>
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
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
  title: {
    fontSize: 70,
    color: "#131058",
    fontWeight: "bold",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
  },
  label: {
    fontWeight: "bold",
    fontSize: 30,
  },
  phoneInput: {
    flexDirection: "row",
    alignItems: "center",
    width: "80%",
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "white",
  },
  countryCode: {
    marginRight: 5,
    borderRightWidth: 1,
    borderRightColor: "rgba(0, 0, 0, 0.1)",
    height: "100%",
    justifyContent: "center",
    paddingRight: 8,
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: "400",
    marginRight: 8,
  },
  input: {
    width: "90%",
    height: 50,
    borderRadius: 10,
  },
  forgotPassword: {
    fontWeight: "bold",
    color: "#0C098C",
    fontSize: 16,
    alignSelf: "flex-start",
    marginLeft: 20,
  },
  footer: {
    alignItems: "center",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 300,
    justifyContent: "center",
    marginTop: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  buttonLoginContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    justifyContent: "space-between",
    width: 300,
    paddingHorizontal: 10,
  },
  buttonLogin: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingHorizontal: 10,
    gap: 10,
    backgroundColor: "white",
    height: 35,
    width: 125,
  },
  textButtonLogin: {
    fontWeight: "400",
    fontSize: 16,
  },
  question: {
    fontWeight: "400",
    fontSize: 16,
    textAlign: "center",
    // marginTop: 20,
    position: "absolute",
    bottom: -140,
  },
});

export default RegisterScreen;
