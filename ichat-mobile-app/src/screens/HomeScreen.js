import React from "react";
import { Button } from "react-native";
import { Text, View } from "react-native";

const HomeScreen = ({ navigation, setUser }) => {
  const handleLogout = () => {
    // Giả lập đăng xuat thành công
    setUser(null);
    // navigation.navigate("AuthNavigator");
  };

  return (
    <View>
      <Text>Home Screen</Text>
      <Button title="Logout" onPress={() => handleLogout()}></Button>
    </View>
  );
};

export default HomeScreen;
