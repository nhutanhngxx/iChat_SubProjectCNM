import React from "react";
import { Text, View, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const HeaderOption = () => {
  const navigation = useNavigation();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        height: 50,
        backgroundColor: "white",
      }}
    >
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Image
          source={require("../../assets/icons/go-back.png")}
          style={{ width: 25, height: 25 }}
        />
      </TouchableOpacity>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginLeft: 10 }}>
        Tùy chọn
      </Text>
    </View>
  );
};

export default HeaderOption;
