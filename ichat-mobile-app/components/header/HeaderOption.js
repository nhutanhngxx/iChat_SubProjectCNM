import React from "react";
import { Text, View, Image, TouchableOpacity, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";

const HeaderOption = () => {
  const navigation = useNavigation();
  return (
    <View
      style={
        Platform.OS === "ios"
          ? {
              flexDirection: "row",
              alignItems: "flex-end",
              width: "100%",
              padding: 10,
              height: 90,
              backgroundColor: "#007bff",
            }
          : {
              flexDirection: "row",
              alignItems: "flex-end",
              width: "100%",
              paddingHorizontal: 10,
              height: 80,
              backgroundColor: "#007bff",
            }
      }
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require("../../assets/icons/go-back.png")}
            style={{
              width: 25,
              height: 25,
              tintColor: "white",
            }}
          />
        </TouchableOpacity>
        <Text style={{ fontWeight: "bold", fontSize: 20, color: "white" }}>
          Tùy chọn cuộc trò chuyện
        </Text>
      </View>
    </View>
  );
};

export default HeaderOption;
