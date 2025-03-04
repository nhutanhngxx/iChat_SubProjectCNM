import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Checkbox } from "react-native-paper";
import CustomButton from "../components/common/CustomButton";

const RegisterScreen = ({ navigation }) => {
  const handleContinueRegister = () => {
    navigation.navigate("EnterOTP");
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

  const [isChecked, setChecked] = useState(false);
  const [isCheckedSocial, setCheckedSocial] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground
        source={require("../assets/images/background.png")}
        style={styles.background}
      >
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Text style={styles.title}>iChat</Text>
            <View style={styles.content}>
              <Text style={styles.label}>Tạo tài khoản mới</Text>

              {/* Input phone number */}
              <View style={styles.countryCodeContainer}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>+84</Text>
                </View>
                <View>
                  <TextInput
                    style={styles.input}
                    placeholder="Số điện thoại"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Checkbox terms */}
              <View style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Checkbox
                    status={isChecked ? "checked" : "unchecked"}
                    onPress={() => setChecked(!isChecked)}
                    color="#48A2FC"
                  />
                  <Text style={{ fontSize: 13 }}>
                    Tôi đồng ý với các điều khoản của{" "}
                    <Text style={{ fontWeight: "bold" }}>iChat</Text>
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Checkbox
                    status={isCheckedSocial ? "checked" : "unchecked"}
                    onPress={() => setCheckedSocial(!isCheckedSocial)}
                    color="#48A2FC"
                  />
                  <Text style={{ fontSize: 13 }}>
                    Tôi đồng ý với điều khoản Mạng xã hội của{" "}
                    <Text style={{ fontWeight: "bold" }}>iChat</Text>
                  </Text>
                </View>
              </View>

              {/* Button continue */}
              <CustomButton
                title="Tiếp theo"
                onPress={() => handleContinueRegister()}
                backgroundColor={"#48A2FC"}
              />
            </View>
          </View>
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
                source={require("../assets/icons/facebook.png")}
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
                source={require("../assets/icons/google.png")}
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
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
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
  countryCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 300,
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#D9D9D9",
  },
  countryCode: {
    marginRight: 8,
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
    width: "100%",
    height: 50,
    borderRadius: 10,
    backgroundColor: "#D9D9D9",
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
