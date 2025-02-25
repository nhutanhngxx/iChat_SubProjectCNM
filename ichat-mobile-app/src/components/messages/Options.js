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
  ScrollView,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import HeaderOption from "../header/HeaderOption";

const Option = ({ route }) => {
  const navigation = useNavigation();
  const { name, avatar } = route.params || {};

  return (
    <View style={styles.container}>
      <HeaderOption />
      <View style={styles.profileContainer}>
        <Image source={avatar} style={styles.avatar} />
        <Text style={styles.name}>{name}</Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 30,
          paddingVertical: 15,
        }}
      >
        <View style={{ width: 100, gap: 10, alignItems: "center" }}>
          <TouchableOpacity>
            <Image
              source={require("../../assets/icons/search.png")}
              style={styles.icon}
            />
          </TouchableOpacity>
          <Text style={{ textAlign: "center" }}>Tìm tin nhắn</Text>
        </View>
        <View style={{ width: 100, gap: 10, alignItems: "center" }}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ViewProfile", {
                name: name,
                avatar: avatar,
              })
            }
          >
            <Image
              source={require("../../assets/icons/me.png")}
              style={styles.icon}
            />
          </TouchableOpacity>
          <Text>Xem hồ sơ</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1, paddingLeft: 20 }}
        contentContainerStyle={{ gap: 15, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false} // Ẩn thanh cuộn
      >
        <View
          style={{
            height: 15,
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            marginHorizontal: -20,
          }}
        ></View>
        {/* 1 */}
        <View>
          <View style={styles.component}>
            <Image
              source={require("../../assets/icons/image.png")}
              style={styles.icon}
            />
            <Text style={styles.title}>Đa phương tiện, tệp tin, liên kết</Text>
          </View>
          <TouchableOpacity
            style={{ paddingLeft: 35 }}
            onPress={() => navigation.navigate("MediaStorage")}
          >
            <Image
              source={require("../../assets/icons/see-more.png")}
              style={{ width: 80, height: 80 }}
            />
          </TouchableOpacity>
        </View>
        <View style={{ gap: 15 }}>
          <View
            style={{
              height: 15,
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              marginHorizontal: -20,
            }}
          ></View>
          {/* 2 */}
          <TouchableOpacity style={styles.component}>
            <Image
              source={require("../../assets/icons/add-group.png")}
              style={styles.icon}
            />
            <Text style={styles.title}>Tạo nhóm với {name}</Text>
          </TouchableOpacity>
          {/* 3 */}
          <TouchableOpacity style={styles.component}>
            <Image
              source={require("../../assets/icons/add-friend.png")}
              style={styles.icon}
            />
            <Text style={styles.title}>Thêm {name} vào nhóm</Text>
          </TouchableOpacity>
          {/* 4 */}
          <TouchableOpacity style={styles.component}>
            <Image
              source={require("../../assets/icons/friend.png")}
              style={styles.icon}
            />
            <Text style={styles.title}>Xem các nhóm chung (5)</Text>
          </TouchableOpacity>
        </View>
        <View style={{ gap: 15 }}>
          <View
            style={{
              height: 15,
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              marginHorizontal: -20,
            }}
          ></View>
          {/* 5 */}
          <TouchableOpacity style={styles.component}>
            <Image
              source={require("../../assets/icons/storage.png")}
              style={styles.icon}
            />
            <Text style={styles.title}>Lưu trữ cuộc trò chuyện</Text>
          </TouchableOpacity>
          {/* 6 */}
          <TouchableOpacity style={styles.component}>
            <Image
              source={require("../../assets/icons/delete-friend.png")}
              style={styles.icon}
            />
            <Text style={styles.title}>Xóa khỏi danh sách bạn bè</Text>
          </TouchableOpacity>
          {/* 7 */}
          <TouchableOpacity style={styles.component}>
            <Image
              source={require("../../assets/icons/delete.png")}
              style={styles.icon}
            />
            <Text style={styles.title}>Xóa lịch sử trò chuyện</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  profileContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  name: {
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 10,
  },
  icon: {
    width: 25,
    height: 25,
  },
  title: {
    fontSize: 16,
  },
  component: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    paddingBottom: 5,
  },
});

export default Option;
