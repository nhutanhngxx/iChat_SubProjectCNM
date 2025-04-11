import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from "react-native";
import CustomButton from "../common/CustomButton";
import authService from "../../services/authService";
import { ActivityIndicator } from "react-native";
import { Appbar } from "react-native-paper";

const EnterOTPScreen = ({ navigation, route }) => {
  const [otp, setOtp] = useState("");
  const { phone, verificationId } = route.params;
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert("Lỗi", "Mã OTP phải có 6 ký tự");
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.validateOTP(phone, otp, verificationId);

      if (result.status === "error") {
        Alert.alert("Lỗi", result.message);
        return;
      }

      if (result.status === "ok") {
        const tempToken = await result.data.user.getIdToken();
        console.log("Temp token: ", tempToken);

        navigation.navigate("PasswordRegister", {
          phone,
          tempToken,
        });
      }
    } catch (error) {
      console.error("Unexpected error during OTP verification:", error);
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
            {/* Header */}
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

            {/* Xác thực OTP ở đây */}
            <View style={styles.content}>
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
              {/* Button Xác nhận OTP vừa nhập */}
              <View style={{ gap: 20, alignSelf: "center" }}>
                {isLoading ? (
                  <ActivityIndicator size="large" color="#48A2FC" /> // Hiển thị spinner khi loading
                ) : (
                  <CustomButton
                    title="Xác nhận"
                    onPress={() => handleVerify()}
                    backgroundColor={"#48A2FC"}
                  />
                )}
              </View>
            </View>
          </View>
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
  },
  title: {
    fontSize: 70,
    color: "#131058",
    fontWeight: "bold",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingBottom: 100,
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
