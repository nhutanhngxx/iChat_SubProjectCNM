import React from "react";
import { Text, View, Image, TextInput, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const HeaderMessages = () => {
  const navigation = useNavigation();
  return (
    <View
      style={{
        height: 50,
        justifyContent: "space-between",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
      }}
    >
      <TouchableOpacity
        style={{
          flexDirection: "row",
          gap: 10,
          alignItems: "center",
          width: 250,
          height: 50,
        }}
        onPress={() => navigation.navigate("SearchScreen", { autoFocus: true })}
      >
        <Image
          source={require("../../assets/icons/search.png")}
          style={{ width: 20, height: 20 }}
        />
        <TextInput
          style={{ fontSize: 16, width: "100", color: "#2F80ED" }}
          placeholder="Tìm kiếm"
          editable={false} // Điều hướng sang Screen search riêng
        ></TextInput>
      </TouchableOpacity>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Image
          source={require("../../assets/icons/qr.png")}
          style={{ width: 20, height: 20 }}
        />
        <Image
          source={require("../../assets/icons/add.png")}
          style={{ width: 22, height: 22 }}
        />
      </View>
    </View>
  );
};

export default HeaderMessages;
