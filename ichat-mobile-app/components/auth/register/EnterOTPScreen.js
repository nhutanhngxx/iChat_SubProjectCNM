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
} from "react-native";
import CustomButton from "../common/CustomButton";
import RegisterService from "../../services/registerService";
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
      const result = await RegisterService.validateOTP(
        phone,
        otp,
        verificationId
      );

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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ImageBackground
        source={require("../../assets/images/background.png")}
        style={styles.background}
      >
        <Appbar.Header
          style={{
            backgroundColor: "transparent",
            paddingTop: 50,
          }}
        >
          <Appbar.BackAction onPress={() => navigation.goBack()} size={30} />
          <Appbar.Content title="Quay lại" />
        </Appbar.Header>
        <View style={styles.container}>
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
          </View>
          <View style={{ gap: 20 }}>
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
    // justifyContent: "center",
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
