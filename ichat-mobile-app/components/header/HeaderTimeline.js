import React from "react";
import { Text, View, Image, TextInput } from "react-native";

const HeaderTimeline = () => {
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
      <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
        <Image
          source={require("../../assets/icons/search.png")}
          style={{ width: 20, height: 20 }}
        />
        <TextInput
          style={{ fontSize: 16, width: "100", color: "#2F80ED" }}
          placeholder="Tìm kiếm"
        ></TextInput>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Image
          source={require("../../assets/icons/create-post.png")}
          style={{ width: 20, height: 20 }}
        />
        <Image
          source={require("../../assets/icons/notification.png")}
          style={{ width: 22, height: 22 }}
        />
      </View>
    </View>
  );
};

export default HeaderTimeline;
