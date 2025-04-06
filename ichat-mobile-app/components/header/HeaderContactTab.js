import { useNavigation } from "@react-navigation/native";
import { View, Image, TextInput, TouchableOpacity } from "react-native";

const HeaderContactTab = () => {
  const navigation = useNavigation();
  return (
    <View
      style={{
        height: 50,
        justifyContent: "space-between",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        width: "100%",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          gap: 15,
          alignItems: "center",
          height: 50,
          flex: 1,
        }}
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
            marginRight: 15,
            paddingLeft: 10,
            borderRadius: 5,
            backgroundColor: "white",
            textAlignVertical: "center",
          }}
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
  );
};

export default HeaderContactTab;
