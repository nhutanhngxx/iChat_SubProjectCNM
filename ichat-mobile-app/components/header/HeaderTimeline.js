import React from "react";
import { Text, View, Image, TextInput, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const HeaderTimeline = () => {
  const navigation = useNavigation();

  return (
    <View
      style={{
        width: "100%",
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
          gap: 15,
          alignItems: "center",
          height: 50,
          flex: 1,
        }}
        onPress={() => navigation.navigate("SearchScreen")}
      >
        <Image
          source={require("../../assets/icons/search.png")}
          style={{ width: 22, height: 22 }}
        />
        <TextInput
          onPress={() => navigation.navigate("SearchScreen")}
          style={{
            fontSize: 15,
            color: "#2F80ED",
            flex: 1,
            height: 35,
            marginRight: 20,
            paddingLeft: 10,
            borderRadius: 5,
            backgroundColor: "white",
            textAlignVertical: "center",
          }}
          placeholder="Tìm kiếm"
          placeholderTextColor={"gray"}
          editable={false}
        ></TextInput>
      </TouchableOpacity>

      <View style={{ flexDirection: "row", gap: 15 }}>
        <Image
          source={require("../../assets/icons/create-post.png")}
          style={{ width: 22, height: 22 }}
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
