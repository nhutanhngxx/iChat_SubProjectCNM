import React, { useState, useEffect, useRef } from "react";
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

import { Modal } from "react-native";

import avatar from "../../assets/images/avatars/avatar1.png";
import editIcon from "../../assets/icons/edit.png";

const ChangeInformation = () => {
  const navigation = useNavigation();

  // useState ngày sinh
  const [dob, setDob] = useState(new Date("2003-03-17")); // lấy data tù thông tin user đăng nhập
  const [showPicker, setShowPicker] = useState(false);

  // useState tên tài khoản
  const [fullName, setFullName] = useState("Nguyễn Nhựt Anh"); // fullname sẽ được lấy từ thông tin user đăng nhập
  const fullNameInputRef = useRef(null);

  // useState giới tính
  const [selectedId, setSelectedId] = useState("1"); // state sẽ thay đổi dựa vào data
  const radioButtons = [
    {
      id: "1",
      label: "Nam",
      value: "Male",
      color: "#3083F9",
    },
    {
      id: "2",
      label: "Nữ",
      value: "Female",
      color: "#3083F9",
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
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
      <View style={{ flexDirection: "row", padding: 30, gap: 30 }}>
        <View style={{ height: 80 }}>
          <Image source={avatar} style={{ height: 80, width: 80 }} />
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

            {/* {showPicker && (
              <Modal transparent={true} animationType="none">
                <View style={styles.modalContainer}>
                  <View style={styles.pickerContainer}>
                    <DateTimePicker
                      value={dob}
                      mode="date"
                      display="default" // có thể sửa thành inline (chỉ IOS) để trông đẹp mắt hơn
                      onChange={(event, selectedDate) => {
                        if (selectedDate) {
                          setDob(selectedDate);
                        }
                      }}
                    />
                    <TouchableOpacity onPress={() => setShowPicker(false)}>
                      <Text style={styles.doneText}>Xong</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            )} */}
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
                        if (selectedDate) {
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

          <View style={{}}>
            <RadioGroup
              radioButtons={radioButtons}
              onPress={setSelectedId}
              selectedId={selectedId}
              layout="row"
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
    paddingBottom: 5,
    justifyContent: "space-between",
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
    // transform: [{ scale: 0.9 }], // Chỉnh size cho pickerContainer
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
    width: "80%",
    alignItems: "center",
  },
  okButton: {
    marginTop: 10,
    backgroundColor: "#3083F9",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  doneText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
