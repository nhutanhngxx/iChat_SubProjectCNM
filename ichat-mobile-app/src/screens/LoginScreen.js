import React from "react";
import { Text, View, Button, SafeAreaView, StyleSheet } from "react-native";

const LoginScreen = ({ navigation, setUser }) => {
  const handleLogin = () => {
    // Giả lập đăng nhập thành công
    setUser(true);
  }



  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Login Screen</Text>
      <Button title="Login" onPress={handleLogin} />
      <Button title="Back" onPress={() => navigation.goBack()} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});

export default LoginScreen;
