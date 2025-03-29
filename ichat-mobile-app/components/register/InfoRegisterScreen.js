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
} from "react-native";
import axios from "axios";
import DateTimePicker from "@react-native-community/datetimepicker";
import CustomButton from "../common/CustomButton";
import editIcon from "../../assets/icons/edit.png";
import { RadioGroup } from "react-native-radio-buttons-group";
import registerService from "../../services/registerService";

const InfoRegisterScreen = ({ navigation, route }) => {
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState(new Date());
  const [gender, setGender] = useState("");
  const radioButtons = [
    { id: "1", label: "Nam", value: "Male", color: "#3083F9" },
    { id: "2", label: "Nữ", value: "Female", color: "#3083F9" },
    { id: "3", label: "Khác", value: "Other", color: "#3083F9" },
  ];
  const [showPicker, setShowPicker] = useState(false);
  const { phone, password, tempToken } = route.params;

  const handleRegister = async () => {
    try {
      const genderValue = radioButtons.find((item) => item.id === gender).value;
      const response = await registerService.register(
        tempToken,
        phone,
        password,
        fullName,
        dob,
        genderValue
      );
      if (response.status === "ok") {
        Alert.alert("Thành công", response.message);
        navigation.navigate("Login");
      } else {
        Alert.alert("Lỗi", response.message);
      }
    } catch (error) {
      Alert.alert("Lỗi", error.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={{ flex: 1 }}>
          <ImageBackground
            source={require("../../assets/images/background.png")}
            style={styles.background}
          >
            <View style={styles.container}>
              <Text style={styles.title}>iChat</Text>

              <View style={styles.content}>
                <Text style={styles.label}>Thông tin người dùng</Text>
              </View>

              {/* Sô điện thoại đã đăng ký */}
              {/* <View style={styles.item}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    marginLeft: 15,
                  }}
                >
                  Số điện thoại
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Số điện thoại"
                  keyboardType="phone-pad"
                  value={phone}
                  editable={false}
                />
              </View> */}

              {/* Họ tên */}
              <View style={styles.item}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    marginLeft: 15,
                  }}
                >
                  Họ và tên
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Họ và tên"
                  keyboardType="default"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              {/* Ngày sinh */}
              <View style={styles.item}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    marginLeft: 15,
                  }}
                >
                  Ngày sinh
                </Text>
                <TouchableOpacity
                  onPress={() => setShowPicker(true)}
                  style={styles.inputContainer}
                >
                  <TextInput
                    style={styles.input}
                    value={dob.toISOString().split("T")[0]}
                    editable={false}
                  />
                  {!showPicker && (
                    <Image
                      source={editIcon}
                      style={{
                        width: 25,
                        height: 25,
                        position: "absolute",
                        right: 10,
                        top: 10,
                      }}
                    />
                  )}
                </TouchableOpacity>

                {showPicker && (
                  <Modal transparent={true} animationType="fade">
                    <View style={styles.modalContainer}>
                      <View style={styles.pickerContainer}>
                        <DateTimePicker
                          value={dob}
                          mode="date"
                          display="spinner" // Hiển thị giao diện có nút OK trên iOS
                          onChange={(event, selectedDate) => {
                            if (Platform.OS === "android") {
                              setShowPicker(false); // Android đóng ngay sau khi chọn
                            }
                            if (dob) {
                              setDob(selectedDate);
                            }
                          }}
                        />
                        {/* Chỉ hiển thị nút "OK" trên iOS */}
                        {Platform.OS === "ios" && (
                          <TouchableOpacity
                            onPress={() => setShowPicker(false)}
                            style={styles.okButton}
                          >
                            <Text style={styles.doneText}>OK</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </Modal>
                )}
              </View>

              {/* Giới tính */}
              <View style={styles.item}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    marginLeft: 15,
                  }}
                >
                  Giới tính
                </Text>
                <RadioGroup
                  radioButtons={radioButtons}
                  onPress={setGender}
                  selectedId={gender}
                  layout="row"
                  labelStyle={{ fontSize: 16 }}
                  containerStyle={{ marginBottom: 20, width: 300 }}
                />
              </View>

              <View style={{ gap: 20 }}>
                <CustomButton
                  title="Đăng ký"
                  onPress={handleRegister}
                  backgroundColor={"#48A2FC"}
                />
              </View>

              <View style={{ position: "absolute", bottom: 20 }}>
                <Text
                  style={styles.question}
                  onPress={() => alert("Những câu hỏi thường gặp")}
                >
                  Những câu hỏi thường gặp
                </Text>
              </View>
            </View>

            {/* </View> */}
          </ImageBackground>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    paddingVertical: 80,
  },
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    // height: 450,
  },
  label: {
    fontWeight: "bold",
    fontSize: 30,
    marginBottom: 40,
  },
  input: {
    width: 300,
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "white",
  },
  forgotPassword: {
    fontWeight: "bold",
    color: "#0C098C",
    fontSize: 16,
    alignSelf: "flex-start",
    marginLeft: 20,
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
  },
});

export default InfoRegisterScreen;
