import React, { useContext } from "react";
import { View, Text, Button } from "react-native";
import { UserContext } from "../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeScreen = ({ navigation }) => {
  const { user, setUser } = useContext(UserContext);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setUser(null); // Reset user trong Context
    navigation.replace("Login");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Chào mừng {user?.full_name}</Text>
      <Button title="Đăng xuất" onPress={handleLogout} />
    </View>
  );
};

export default HomeScreen;
