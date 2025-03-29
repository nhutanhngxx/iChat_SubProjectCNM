import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  ScrollView,
} from "react-native";
import CustomButton from "../common/CustomButton";
import RegisterService from "../../services/registerService";

const EnterOTPScreen = ({ navigation, route }) => {
  const [otp, setOtp] = useState("");
  const [isOTPValid, setIsOTPValid] = useState(false);
  // const { phone, verificationId } = route.params;

  const handleVerify = async () => {
    const otpCode = otp.join("");
    const result = await RegisterService.validateOTP(phone, otpCode);

    if (result.status === "error") {
      Alert.alert("Lỗi", result.message);
      return;
    }

    if (result.status === "ok") {
      navigation.navigate("PasswordRegister", {
        phone,
        tempToken: result.data.tempToken,
      });
    }
  };

  const handleLogin = () => {
    navigation.navigate("Login");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ImageBackground
        source={require("../../assets/images/background.png")}
        style={styles.background}
      >
        <View style={styles.container}>
          <View style={styles.content}>
            {!isOTPValid ? (
              <>
                <Text style={styles.label}>Nhập mã OTP</Text>
                <View style={styles.otpContainer}>
                  <TextInput
                    style={styles.otpInput}
                    placeholder="Nhập mã OTP"
                    keyboardType="number-pad"
                    value={otp}
                    onChangeText={setOtp}
                    maxLength={6}
                  />
                </View>
              </>
            ) : (
              <Text style={styles.success}>
                ĐĂNG KÝ TÀI KHOẢN THÀNH CÔNG !!!
              </Text>
            )}
          </View>
          <View style={{ gap: 20 }}>
            {isOTPValid ? (
              <CustomButton
                title="Đăng nhập"
                onPress={() => handleLogin()}
                backgroundColor={"#48A2FC"}
              />
            ) : (
              <CustomButton
                title="Tiếp theo"
                onPress={() => handleVerify()}
                backgroundColor={"#48A2FC"}
              />
            )}
          </View>
        </View>
      </ImageBackground>
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
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  otpInput: {
    width: "80%",
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: 0,
    borderBottomWidth: 1,
    borderBottomColor: "gray",
    textAlign: "center",
  },
  success: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default EnterOTPScreen;
