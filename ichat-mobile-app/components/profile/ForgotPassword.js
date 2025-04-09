import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ImageBackground,
} from "react-native";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { firebaseConfig } from "../../config/firebase";
import authService from "../../services/authService";
import axios from "axios";
import {
  PhoneAuthProvider,
  signInWithCredential,
  getAuth,
} from "firebase/auth";

const API_iChat = "http://192.168.1.6:5001";

const ForgotPasswordScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [verificationId, setVerificationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const recaptchaVerifier = useRef(null);

  const handleSendOTP = async () => {
    if (!phone.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
      return;
    }

    // Định dạng số điện thoại
    const formattedPhone = phone.startsWith("0")
      ? phone.replace(/^0/, "+84")
      : `+84${phone}`;

    try {
      setLoading(true);
      const res = await axios.post(`${API_iChat}/auth/confirm-phone`, {
        phone: formattedPhone,
      });

      if (res.data.status === "ok") {
        const phoneProvider = new PhoneAuthProvider(getAuth());
        const verificationId = await phoneProvider.verifyPhoneNumber(
          formattedPhone,
          recaptchaVerifier.current
        );

        setVerificationId(verificationId);
        setStep(2);
        Alert.alert("Thông báo", "Đã gửi mã OTP tới số điện thoại.");
      } else {
        Alert.alert("Lỗi", res.data.message || "Số điện thoại không hợp lệ.");
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Không thể gửi mã OTP.";
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mã OTP");
      return;
    }
    try {
      setLoading(true);
      const result = await authService.validateOTP(phone, otp, verificationId);
      if (result.status === "ok") {
        setStep(3);
      } else {
        Alert.alert("Lỗi", "Mã OTP không đúng.");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Xác minh OTP thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu mới");
      return;
    }

    const normalizePhone = (phoneNumber) => {
      const trimmed = phoneNumber.trim();
      if (trimmed.startsWith("0")) {
        return trimmed.replace(/^0/, "+84");
      }
      return trimmed;
    };

    const formattedPhone = normalizePhone(phone);

    try {
      setLoading(true);
      await axios.post(`${API_iChat}/auth/reset-password`, {
        phone: formattedPhone,
        newPassword,
      });
      Alert.alert(
        "Thành công",
        "Mật khẩu đã được thay đổi. Hãy đăng nhập lại."
      );
      navigation.goBack();
    } catch (error) {
      console.log(
        "Lỗi khi đổi mật khẩu:",
        error?.response?.data || error.message
      );
      Alert.alert("Lỗi", "Không thể đặt lại mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Text style={styles.title}>Bạn quên mật khẩu à?</Text>
            <Text style={styles.description}>
              Nhập số điện thoại của bạn để nhận mã xác minh
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
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.6 }]}
              onPress={handleSendOTP}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Đang gửi..." : "Gửi mã OTP"}
              </Text>
            </TouchableOpacity>
          </>
        );
      case 2:
        return (
          <>
            <Text style={styles.title}>Nhập mã OTP</Text>
            <Text style={styles.description}>
              Không chia sẻ mã OTP với bất kỳ ai nhé
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mã OTP"
              keyboardType="number-pad"
              value={otp}
              onChangeText={setOtp}
              maxLength={6}
            />
            <TouchableOpacity style={styles.button} onPress={handleVerifyOTP}>
              <Text style={styles.buttonText}>Xác minh</Text>
            </TouchableOpacity>
          </>
        );
      case 3:
        return (
          <>
            <Text style={styles.title}>Đặt lại mật khẩu</Text>
            <Text style={styles.description}>
              Đặt lại mật khẩu mới cho tài khoản của bạn
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu mới"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleResetPassword}
            >
              <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>
            </TouchableOpacity>
          </>
        );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ImageBackground
          source={require("../../assets/images/background.png")}
          resizeMode="cover"
          style={styles.background}
        >
          <ScrollView contentContainerStyle={styles.container}>
            <FirebaseRecaptchaVerifierModal
              ref={recaptchaVerifier}
              firebaseConfig={firebaseConfig}
            />
            {renderStep()}
          </ScrollView>
        </ImageBackground>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    justifyContent: "center",
  },
  background: {
    flex: 1,
  },
  title: {
    fontSize: 30,
    marginBottom: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
    fontSize: 18,
  },
  button: {
    backgroundColor: "#3083F9",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  description: {
    fontSize: 12,
    marginBottom: 20,
    opacity: 0.6,
    textAlign: "center",
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

export default ForgotPasswordScreen;
