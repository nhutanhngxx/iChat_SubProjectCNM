import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  Image,
  TouchableOpacity,
  Button,
} from "react-native";

const LauncherScreen = ({ navigation, setUser }) => {
  const handleLogin = () => {
    navigation.navigate("Login");
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/images/background.png")}
        style={styles.background}
      >
        <View style={styles.content}>
          <Text style={styles.title}>iChat</Text>
          <View>
            <Image
              source={require("../assets/images/logo.png")}
              style={{ height: 500, width: 500 }}
            />
          </View>
          <View>
            <TouchableOpacity></TouchableOpacity>
            <Button title="Login" onPress={() => handleLogin()}></Button>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

export default LauncherScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 70,
    color: "#fff",
    fontWeight: "bold",
  },
});
