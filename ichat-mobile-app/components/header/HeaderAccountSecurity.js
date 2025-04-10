import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import goBackIcon from "../../assets/icons/go-back.png";

import { StatusBar } from "expo-status-bar";

const HeaderAccountSecurity = () => {
  const navigation = useNavigation();

  return (
    <View
      style={{
        width: "100%",
        height: 90,
        justifyContent: "space-between",
        flexDirection: "row",
        alignItems: "flex-end",
        backgroundColor: "#3083F9",
        padding: 10,
      }}
    >
      <TouchableOpacity
        style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
        onPress={() => navigation.goBack()}
      >
        <Image
          source={goBackIcon}
          style={{ width: 25, height: 25, tintColor: "#fff" }}
        />
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
          Tài khoản và bảo mật
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default HeaderAccountSecurity;
