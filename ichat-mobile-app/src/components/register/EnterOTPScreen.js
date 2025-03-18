import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  TextInput,
  Alert,
} from "react-native";
import CustomButton from "../common/CustomButton";
import RegisterService from "../../services/registerService";

const EnterOTPScreen = ({ navigation, route }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isOTPValid, setIsOTPValid] = useState(false);
  const inputRefs = useRef([]);
  const { phone } = route.params;

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1].focus();
    }
    if (!text && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

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
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground
        source={require("../../assets/images/background.png")}
        style={styles.background}
      >
        <View style={styles.container}>
          <Text style={styles.title}>iChat</Text>
          <View style={styles.content}>
            {!isOTPValid ? (
              <>
                <Text style={styles.label}>Nhập mã OTP</Text>
                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => (inputRefs.current[index] = ref)}
                      style={styles.otpInput}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(text) => handleChange(text, index)}
                      onKeyPress={({ nativeEvent }) => {
                        if (
                          nativeEvent.key === "Backspace" &&
                          !otp[index] &&
                          index > 0
                        ) {
                          handleChange("", index - 1);
                        }
                      }}
                    />
                  ))}
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
    width: 40,
    height: 50,
    borderBottomWidth: 2,
    marginHorizontal: 5,
    fontSize: 20,
    textAlign: "center",
  },
  success: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default EnterOTPScreen;
