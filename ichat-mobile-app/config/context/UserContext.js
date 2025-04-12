import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userState, setUserState] = useState(null);

  // Tạo hàm setUser để vừa cập nhật state, vừa lưu vào AsyncStorage
  const setUser = async (newUser) => {
    try {
      setUserState(newUser); // cập nhật state trong context
      if (newUser) {
        // Chỉ lưu khi newUser không null
        await AsyncStorage.setItem("user", JSON.stringify(newUser)); // lưu vào AsyncStorage
      } else {
        await AsyncStorage.removeItem("user");
      }
    } catch (error) {
      console.error("Lỗi khi lưu user vào AsyncStorage:", error);
    }
  };

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

  return (
    <UserContext.Provider value={{ user: userState, setUser, isLoading }}>
      {!isLoading && children}
    </UserContext.Provider>
  );
};
