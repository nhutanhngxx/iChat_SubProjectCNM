import React, { useState, useRef, useContext } from "react";
import {
  Text,
  TextInput,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import RadioGroup from "react-native-radio-buttons-group";
import DateTimePicker from "@react-native-community/datetimepicker";
import { UserContext } from "../../context/UserContext";
import { Modal } from "react-native";
import axios from "axios";

import editIcon from "../../assets/icons/edit.png";

const ChangeInformation = () => {
  const navigation = useNavigation();
  const { user, setUser } = useContext(UserContext);

  const API_iChat = "http://172.20.65.201:5001/api";

  const [dob, setDob] = useState(user?.dob ? new Date(user.dob) : new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [selectedId, setSelectedId] = useState(
    user?.gender === "Male" ? "1" : user?.gender === "Female" ? "2" : "3"
  );
  const [loading, setLoading] = useState(false);
  const fullNameInputRef = useRef(null);

  const radioButtons = [
    { id: "1", label: "Nam", value: "Male", color: "#3083F9" },
    { id: "2", label: "Nữ", value: "Female", color: "#3083F9" },
    { id: "3", label: "Khác", value: "Other", color: "#3083F9" },
  ];

  // Validation trước khi gửi
  const validateInput = () => {
    if (!fullName.trim()) {
      alert("Vui lòng nhập họ tên đầy đủ.");
      return false;
    }
    return true;
  };

  // Hàm xử lý cập nhật thông tin
  const handleSave = async () => {
    if (!validateInput()) return;

    setLoading(true);
    try {
      const updatedData = {
        full_name: fullName.trim(),
        gender: radioButtons.find((rb) => rb.id === selectedId)?.value,
        dob: dob.toISOString().split("T")[0],
      };

      const response = await axios.put(
        `${API_iChat}/update/${user.id}`,
        updatedData,
        {
          headers: {
            "Content-Type": "application/json",
            // Nếu cần token: "Authorization": `Bearer ${user.token}`,
          },
        }
      );

      const result = response.data;
      if (result.success) {
        setUser({ ...user, ...result.data });
        alert("Cập nhật thông tin thành công!");
        navigation.goBack();
      } else {
        alert(result.message || "Có lỗi xảy ra khi cập nhật thông tin.");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      if (error.response) {
        alert(
          error.response.data.message || "Có lỗi xảy ra khi cập nhật thông tin."
        );
      } else {
        alert("Lỗi kết nối server. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false); // Tắt loading
    }
  };

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

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 20,
        }}
      >
        <View style={{ height: 100 }}>
          <Image
            source={{ uri: user.avatar_path }}
            style={{ height: 100, width: 100, borderRadius: 10 }}
          />
        </View>
        <View
          style={{ justifyContent: "space-between", width: "65%", gap: 20 }}
        >
          <View style={styles.container}>
            <TextInput
              style={styles.value}
              onChangeText={setFullName}
              value={fullName}
              ref={fullNameInputRef}
            />
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
                        if (Platform.OS === "android") setShowPicker(false);
                        if (selectedDate) setDob(selectedDate);
                      }}
                    />
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

      <TouchableOpacity
        onPress={handleSave}
        style={{
          backgroundColor: "rgba(217, 217, 217, 0.5)",
          padding: 15,
          width: "80%",
          borderRadius: 20,
          alignSelf: "center",
          opacity: loading ? 0.7 : 1, // Giảm độ mờ khi loading
        }}
        disabled={loading} // Vô hiệu hóa nút khi đang loading
      >
        {loading ? (
          <ActivityIndicator size="small" color="#3237DA" />
        ) : (
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
        )}
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
