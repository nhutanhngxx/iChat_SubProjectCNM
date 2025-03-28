import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const HeaderViewProfile = () => {
  const navigation = useNavigation();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        height: 50,
        paddingRight: 10,
        backgroundColor: "rgba(217, 217, 217, 0.5)",
        justifyContent: "space-between",
      }}
    >
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Image
          source={require("../../assets/icons/go-back.png")}
          style={{ width: 25, height: 25 }}
        />
      </TouchableOpacity>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
        <TouchableOpacity>
          <Image
            source={require("../../assets/icons/phone-call.png")}
            style={{ width: 20, height: 20 }}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image
            source={require("../../assets/icons/more.png")}
            style={{ width: 20, height: 20 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HeaderViewProfile;
