import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUserState(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Lỗi khi tải user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  // Hàm cập nhật user và lưu vào AsyncStorage
  const setUser = async (newUser) => {
    try {
      setUserState(newUser);
      await AsyncStorage.setItem("user", JSON.stringify(newUser));
    } catch (error) {
      console.error("Lỗi khi lưu user:", error);
    }
  };

  if (isLoading) {
    return null; // hoặc splash/loading screen
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
