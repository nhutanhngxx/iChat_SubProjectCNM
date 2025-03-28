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
      }}
    >
      <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
        <Image
          source={require("../../assets/icons/search.png")}
          style={{ width: 20, height: 20 }}
        />
        <TextInput
          style={{
            fontSize: 16,
            width: "100",
            color: "#2F80ED",
          }}
          placeholder="Tìm kiếm"
        ></TextInput>
      </View>

      <TouchableOpacity
        style={{ flexDirection: "row", gap: 10 }}
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
