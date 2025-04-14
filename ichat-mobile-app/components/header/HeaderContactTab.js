import { useNavigation } from "@react-navigation/native";
import {
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";

const HeaderContactTab = () => {
  const navigation = useNavigation();
  return (
    <View
      style={{
        height: 90,
        justifyContent: "space-between",
        flexDirection: "row",
        alignItems: "flex-end",
        padding: 10,
        width: "100%",
        backgroundColor: "rgba(47, 128, 237, 0.3)",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            flexDirection: "row",
            gap: 15,
            alignItems: "center",
            flex: 1,
          }}
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
                    marginRight: 15,
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
                    marginRight: 15,
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
        </View>

        <TouchableOpacity
          style={{ flexDirection: "row" }}
          onPress={() => navigation.navigate("AddFriend")}
        >
          <Image
            source={require("../../assets/icons/add-friend.png")}
            style={{ width: 20, height: 20 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HeaderContactTab;
