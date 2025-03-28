import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Text,
  TextInput,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import RadioGroup from "react-native-radio-buttons-group";
import DateTimePicker from "@react-native-community/datetimepicker";
import { UserContext } from "../../context/UserContext";

import { Modal } from "react-native";

import avatar from "../../assets/images/avatars/avatar1.png";
import editIcon from "../../assets/icons/edit.png";

const ChangeInformation = () => {
  const navigation = useNavigation();
  const { user } = useContext(UserContext);

  // useState ngày sinh
  const [dob, setDob] = useState(user?.dob ? new Date(user.dob) : new Date()); // lấy data tù thông tin user đăng nhập
  const [showPicker, setShowPicker] = useState(false);

  // useState tên tài khoản
  const [fullName, setFullName] = useState(user?.full_name || "");
  const fullNameInputRef = useRef(null);

  // useState giới tính
  const [selectedId, setSelectedId] = useState(
    user?.gender === "Male" ? "1" : user?.gender === "Female" ? "2" : "3"
  );

  const radioButtons = [
    { id: "1", label: "Nam", value: "Male", color: "#3083F9" },
    { id: "2", label: "Nữ", value: "Female", color: "#3083F9" },
    { id: "3", label: "Khác", value: "Other", color: "#3083F9" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", paddingTop: 40 }}>
      <View
        style={{
          backgroundColor: "#fff",
          paddingRight: 10,
          paddingTop: 5,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          height: 50,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require("../../assets/icons/go-back.png")}
            style={{ width: 25, height: 25 }}
          />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>
          Chỉnh sửa thông tin
        </Text>
      </View>

      {/* Các thông tin được phép thay đổi */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 20,
        }}
      >
        <View style={{ height: 80 }}>
          <Image
            source={{ uri: user.avatar_path }}
            style={{ height: 100, width: 100, borderRadius: 10 }}
          />
        </View>
        <View
          style={{
            justifyContent: "space-between",
            width: "65%",
            gap: 20,
          }}
        >
          <View style={styles.container}>
            <TextInput
              style={styles.value}
              onChangeText={setFullName}
              value={fullName}
              ref={fullNameInputRef}
            ></TextInput>
            <TouchableOpacity onPress={() => fullNameInputRef.current?.focus()}>
              <Image source={editIcon} style={{ width: 25, height: 25 }} />
            </TouchableOpacity>
          </View>

          <View style={styles.container}>
            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              style={styles.inputContainer}
            >
              <TextInput
                style={styles.value}
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
                    right: 0,
                  }}
                />
              )}
            </TouchableOpacity>
            {showPicker && (
              <Modal transparent={true} animationType="fade">
                <View style={styles.modalContainer}>
                  <View style={styles.pickerContainer}>
                    {Platform.OS === "ios" && (
                      <Text style={{ fontSize: 25 }}>
                        Chọn ngày sinh của bạn
                      </Text>
                    )}
                    <DateTimePicker
                      value={dob}
                      mode="date"
                      display="spinner"
                      onChange={(event, selectedDate) => {
                        if (Platform.OS === "android") {
                          setShowPicker(false); // Android đóng ngay sau khi chọn
                        }
                        if (selectedDate) {
                          setDob(selectedDate);
                        }
                      }}
                    />
                    {/* Chỉ hiển thị nút "Lưu thay đổi" trên iOS */}
                    {Platform.OS === "ios" && (
                      <TouchableOpacity
                        onPress={() => setShowPicker(false)}
                        style={styles.okButton}
                      >
                        <Text style={styles.doneText}>Lưu thay đổi</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </Modal>
            )}
          </View>

          <View>
            <RadioGroup
              radioButtons={radioButtons}
              onPress={setSelectedId}
              selectedId={selectedId}
              layout="row"
              containerStyle={{
                transform: [{ scale: 0.8 }],
                alignSelf: "flex-end",
              }}
            />
          </View>
        </View>
      </View>

      {/* Button Lưu thông tin đã thay đổi */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          backgroundColor: "rgba(217, 217, 217, 0.5)",
          padding: 15,
          width: "80%",
          borderRadius: 20,
          alignSelf: "center",
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: "#3237DA",
            textAlign: "center",
          }}
        >
          Lưu thông tin
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChangeInformation;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "rgba(217, 217, 217, 0.5)",
    justifyContent: "space-between",
    alignItems: "center",
  },
  value: {
    fontSize: 18,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  valueContainer: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  doneText: {
    color: "#3083F9",
    fontSize: 18,
    marginVertical: 20,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "85%",
    alignItems: "center",
  },
  okButton: {
    marginTop: 10,
    borderRadius: 5,
  },
  doneText: {
    color: "#3083F9",
    fontSize: 18,
    fontWeight: "bold",
  },
});
