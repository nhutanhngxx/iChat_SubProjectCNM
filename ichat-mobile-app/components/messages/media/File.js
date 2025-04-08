import React from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const FileTab = () => {
  const renderItemFile = ({ item }) => (
    <TouchableOpacity style={{ flexDirection: "row" }}>
      <Image
        source={require("../../../assets/icons/download.png")}
        style={{ width: 30, height: 30 }}
      />
      <View>
        <Text>Tên file</Text>
        <View style={{ flexDirection: "row" }}>
          <Text>Dung lượng file</Text>
          <Text>Người gửi</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View>
      <Text>FileTab</Text>
    </View>
  );
};

export default FileTab;
