import React, { useContext, useEffect, useState } from "react";
import AuthNavigator from "../src/navigation/AuthNavigator";
import AppNavigator from "../src/navigation/AppNavigator";
import { UserProvider, UserContext } from "../src/context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View } from "react-native";

const MainNavigator = () => {
  const { user, setUser } = useContext(UserContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log("Lỗi khi tải user:", error);
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2F80ED" />
      </View>
    );
  }

  return user ? <AppNavigator /> : <AuthNavigator />;
};

const App = () => {
  return (
    <UserProvider>
      <MainNavigator />
    </UserProvider>
  );
};

export default App;
