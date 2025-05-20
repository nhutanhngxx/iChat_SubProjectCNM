import React, { useContext, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { UserContext } from "../../config/context/UserContext";
import goBackIcon from "../../assets/icons/go-back.png";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { StatusBar } from "expo-status-bar";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { firebaseConfig } from "../../config/firebase";
import authService from "../../services/authService";
import { getHostIP } from "../../services/api";

const maskPhoneNumber = (phone) => {
  if (!phone || phone.length < 10) return phone;
  return phone.slice(0, 5) + "***" + phone.slice(-3);
};

const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  const cleaned = phone.replace(/\s+/g, "");
  if (cleaned.startsWith("+84")) return cleaned;
  if (cleaned.startsWith("0")) return "+84" + cleaned.slice(1);
  if (cleaned.startsWith("84")) return "+84" + cleaned.slice(2);
  return "+84" + cleaned;
};

const ChangePhoneNumber = () => {
  const navigation = useNavigation();
  const { user, setUser } = useContext(UserContext);
  const ipAdr = getHostIP();
  // const API_iChat = `http://${ipAdr}:5001`;
  const API_iChat = `${Constants.expoConfig.extra.apiUrl}`;
  const recaptchaVerifier = useRef(null);
  const [verificationId, setVerificationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [formattedNewPhone, setFormattedNewPhone] = useState("");

  const handleVerifyPassword = async (phone, password) => {
    if (!phone || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại và mật khẩu.");
      return;
    }
    console.log(password);

    try {
      setIsLoading(true);
      const isValid = await authService.checkPassword({ phone, password });
      console.log("Check Password Response: ", isValid);
      if (isValid === true) {
        setStep(2);
      } else {
        Alert.alert("Lỗi", "Mật khẩu không chính xác.");
      }
    } catch (error) {
      console.error("Lỗi khi xác thực mật khẩu:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOTP = async () => {
    const formatted = formatPhoneNumber(newPhone);
    setFormattedNewPhone(formatted);

    if (!newPhone) {
      Alert.alert("Thông báo", "Vui lòng nhập số điện thoại bạn cần thay đổi!");
      return;
    }

    try {
      setIsLoading(true);
      const isExistedPhone = await authService.checkExistedPhone(formatted);
      if (isExistedPhone.result) {
        const result = await authService.sendOTPWithoutCheck(
          newPhone,
          recaptchaVerifier
        );
        if (result.status === "ok") {
          setVerificationId(result.verificationId);
          setStep(3);
        } else {
          Alert.alert("Lỗi", result.message);
        }
      } else {
        Alert.alert("Lỗi", isExistedPhone.message);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi gửi OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert("Lỗi", "Vui lòng nhập mã OTP hợp lệ.");
      return;
    }

    if (!formattedNewPhone) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại hợp lệ.");
      return;
    }

    try {
      setIsLoading(true);
      const result = await authService.validateOTP(
        newPhone,
        otp,
        verificationId
      );

      if (result.status === "ok") {
        await authService.changePhone(user.id, formattedNewPhone);
        setUser({ ...user, phone: formattedNewPhone });
        navigation.navigate("ProfileInformation");
      } else {
        Alert.alert("Lỗi", result.message);
      }
    } catch (error) {
      console.error("Xác thực OTP lỗi:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi xác thực.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "android" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <StatusBar style="light" />
          <FirebaseRecaptchaVerifierModal
            ref={recaptchaVerifier}
            firebaseConfig={firebaseConfig}
          />
          <View style={styles.header}>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
              onPress={() => navigation.goBack()}
            >
              <Image
                source={goBackIcon}
                style={{ width: 25, height: 25, tintColor: "#fff" }}
              />
              <Text style={styles.headerTitle}>Thay đổi số điện thoại</Text>
            </TouchableOpacity>
          </View>

          <View style={{ padding: 20, flex: 1 }}>
            {step === 1 ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Số điện thoại hiện tại</Text>
                  <Text style={styles.disabledInput}>
                    {maskPhoneNumber(user?.phone)}
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mật khẩu của bạn</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập mật khẩu của bạn"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    placeholderTextColor="#999"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, isLoading && { opacity: 0.6 }]}
                  onPress={() => handleVerifyPassword(user?.phone, password)}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}>Xác thực tài khoản</Text>
                </TouchableOpacity>

                <View style={{ height: 50 }} />

                <View style={styles.noticeBox}>
                  <Text style={styles.sectionTitle}>Thông tin</Text>
                  <Text style={styles.notice}>
                    • Sau khi thay đổi, tài khoản sẽ được liên kết với số điện
                    thoại mới.
                  </Text>
                  <Text style={styles.notice}>
                    • Bạn bè và người lạ có thể tìm thấy bạn qua số điện thoại
                    mới.
                  </Text>
                </View>

                <View
                  style={[styles.noticeBox, { backgroundColor: "#fff0f0" }]}
                >
                  <Text style={[styles.sectionTitle, { color: "#d32f2f" }]}>
                    Lưu ý
                  </Text>
                  <Text style={[styles.notice, { color: "#d32f2f" }]}>
                    • Mỗi tài khoản chỉ được liên kết với một số điện thoại.
                  </Text>
                </View>
              </>
            ) : step === 2 ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Số điện thoại hiện tại</Text>
                  <Text style={styles.disabledInput}>
                    {maskPhoneNumber(user?.phone)}
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Số điện thoại mới</Text>
                  <View
                    style={
                      Platform.OS === "ios"
                        ? [styles.phoneInputContainer, { paddingVertical: 10 }]
                        : styles.phoneInputContainer
                    }
                  >
                    <View style={styles.countryCodeBox}>
                      <Text style={styles.countryCodeText}>+84</Text>
                    </View>
                    <TextInput
                      style={styles.phoneInput}
                      placeholder="Nhập số điện thoại mới"
                      keyboardType="phone-pad"
                      value={newPhone}
                      onChangeText={setNewPhone}
                      maxLength={10}
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.button, isLoading && { opacity: 0.6 }]}
                  onPress={handleRequestOTP}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}>Gửi mã OTP</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.label}>
                  Mã xác thực đã được gửi đến số:{" "}
                  <Text style={{ fontWeight: "400" }}>
                    {maskPhoneNumber(formatPhoneNumber(newPhone))}
                  </Text>
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nhập mã OTP</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập mã OTP"
                    keyboardType="number-pad"
                    value={otp}
                    onChangeText={setOtp}
                    maxLength={6}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, isLoading && { opacity: 0.6 }]}
                  onPress={handleVerifyOTP}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}>Xác nhận</Text>
                </TouchableOpacity>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    marginTop: 15,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      setStep(2);
                      setOtp("");
                    }}
                  >
                    <Text style={styles.link}>Nhập lại số điện thoại</Text>
                  </TouchableOpacity>
                  <Text style={{ marginHorizontal: 10 }}>|</Text>
                  <TouchableOpacity onPress={handleRequestOTP}>
                    <Text style={styles.link}>Gửi lại OTP</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    width: "100%",
    height: 90,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#3083F9",
    padding: 10,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  noticeBox: {
    backgroundColor: "#e6f0ff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 24,
  },
  notice: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: "#333",
    fontWeight: "bold",
  },
  disabledInput: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    color: "#666",
  },
  input: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#3083F9",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  link: {
    color: "#3083F9",
    fontSize: 16,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 12,
  },
  countryCodeBox: {
    marginRight: 8,
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    paddingRight: 8,
  },
  countryCodeText: {
    fontSize: 16,
    color: "#333",
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
});

export default ChangePhoneNumber;
