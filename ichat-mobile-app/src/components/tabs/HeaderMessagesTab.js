import React from "react";
import { Text, View, Image, TextInput } from "react-native";

const HeaderMessages = () => {
  return (
    <View
      style={{
        height: 40,
        justifyContent: "space-between",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
      }}
    >
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Image
          source={require("../../assets/icons/search.png")}
          style={{ width: 22, height: 22 }}
        />
        <TextInput
          style={{ fontSize: 18, width: "100", color: "#2F80ED" }}
          placeholder="Tìm kiếm"
        ></TextInput>
      </View>

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
