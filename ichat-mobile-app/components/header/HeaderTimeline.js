import React from "react";
import {
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const HeaderTimeline = () => {
  const navigation = useNavigation();

  return (
    <View
      style={{
        width: "100%",
        height: 90,
        justifyContent: "space-between",
        flexDirection: "row",
        alignItems: "flex-end",
        padding: 10,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            gap: 15,
            alignItems: "center",
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
            style={
              Platform.OS === "ios"
                ? {
                    fontSize: 15,
                    color: "#2F80ED",
                    flex: 1,
                    height: 30,
                    marginRight: 20,
                    paddingLeft: 10,
                    borderRadius: 5,
                    backgroundColor: "white",
                    textAlignVertical: "center",
                  }
                : {
                    fontSize: 15,
                    color: "#2F80ED",
                    flex: 1,
                    height: 38,
                    marginRight: 20,
                    paddingLeft: 10,
                    borderRadius: 5,
                    backgroundColor: "white",
                    textAlignVertical: "center",
                  }
            }
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
    </View>
  );
};

export default HeaderTimeline;
