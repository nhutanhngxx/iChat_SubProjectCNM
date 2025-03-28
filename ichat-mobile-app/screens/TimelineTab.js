import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Image,
  TextInput,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

import HeaderTimeline from "../components/header/HeaderTimeline";

import { useNavigation } from "@react-navigation/native";

const getTimeDifference = (timestamp) => {
  const now = Date.now();
  const difference = now - timestamp;

  const seconds = Math.floor(difference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} ngày trước`;
  if (hours > 0) return `${hours} giờ trước`;
  if (minutes > 0) return `${minutes} phút trước`;
  return "Vừa xong";
};

const posts = [
  {
    id: 1,
    user: {
      name: "Nguyễn Nhựt Anh",
      avatar: require("../assets/images/avatars/avatar1.png"),
    },
    timestamp: Date.now() - 10 * 60 * 1000, // 10 phút trước
    content: "Hôm nay trời thật đẹp! ☀️",
    images: [
      "https://i.ibb.co/P6p5SCQ/1.png",
      "https://i.ibb.co/P6p5SCQ/1.png",
    ],
    likes: 120,
    comments: 35,
  },
  {
    id: 2,
    user: {
      name: "Trần Minh Quân",
      avatar: require("../assets/images/avatars/avatar2.png"),
    },
    timestamp: Date.now() - 3 * 60 * 60 * 1000,
    content: "Một ngày làm việc hiệu quả! 💼🚀",
    images: ["https://i.ibb.co/P6p5SCQ/1.png"],
    likes: 85,
    comments: 12,
  },
  {
    id: 3,
    user: {
      name: "Lê Phương Thảo",
      avatar: require("../assets/images/avatars/avatar3.png"),
    },
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    content: "Cùng nhau tận hưởng cuối tuần nào! 🍕🎉",
    images: [
      "https://i.ibb.co/P6p5SCQ/1.png",
      "https://i.ibb.co/P6p5SCQ/1.png",
      "https://i.ibb.co/P6p5SCQ/1.png",
      "https://i.ibb.co/P6p5SCQ/1.png",
    ],
    likes: 200,
    comments: 50,
  },
];

const TimelineTab = () => {
  const navigation = useNavigation();

  const renderPost = ({ item }) => {
    return (
      <View style={styles.postContainer}>
        {/* Header post */}
        <View style={styles.postHeader}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Image source={item.user.avatar} style={styles.avatar} />
            <View>
              <Text style={styles.userName}>{item.user.name}</Text>
              <Text style={styles.timestamp}>
                {getTimeDifference(item.timestamp)}
              </Text>
            </View>
          </View>

          <Image
            source={require("../assets/icons/more.png")}
            style={{ width: 25, height: 25 }}
          />
        </View>

        {/* Content post */}
        <View style={{ paddingTop: 10 }}>
          <Text style={styles.postContent}>{item.content}</Text>
          {/* Hiển thị ảnh đăng */}
          {item.images.length > 0 && (
            <View style={{ marginTop: 10 }}>
              {item.images.length === 1 ? (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("ViewImagePost", { imageUrl: item })
                  }
                >
                  <Image
                    source={
                      typeof item.images[0] === "string"
                        ? { uri: item.images[0] }
                        : item.images[0]
                    }
                    style={{
                      width: "100%",
                      height: 200,
                      borderRadius: 5,
                    }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ) : (
                <FlatList
                  data={item.images}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(image, index) => index.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("ViewImagePost", { imageUrl: item })
                      }
                    >
                      <Image
                        source={typeof item === "string" ? { uri: item } : item}
                        style={{
                          width: 100,
                          height: 100,
                          marginRight: 10,
                          borderRadius: 5,
                        }}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          )}
        </View>

        {/* Likes, Comments */}
        <View style={styles.actionsContainer}>
          <View style={styles.action}>
            <TouchableOpacity>
              <Image
                source={require("../assets/icons/heart-outline.png")}
                style={styles.icon}
              />
            </TouchableOpacity>
            <Text style={styles.actionText}>{item.likes}</Text>
          </View>
          <View style={styles.action}>
            <TouchableOpacity>
              <Image
                source={require("../assets/icons/comment.png")}
                style={styles.icon}
              />
            </TouchableOpacity>
            <Text style={styles.actionText}>{item.comments}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.createPostContainer}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 15 }}>
        <Image
          source={require("../assets/images/avatars/avatar1.png")}
          style={styles.avatar}
        />
        <TextInput
          style={styles.input}
          placeholder="Hôm nay bạn cảm thấy thế nào?"
        />
      </View>

      <View style={styles.postOptions}>
        <TouchableOpacity style={styles.postOption}>
          <Image
            source={require("../assets/icons/image.png")}
            style={styles.optionIcon}
          />
          <Text>Hình ảnh</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postOption}>
          <Image
            source={require("../assets/icons/video.png")}
            style={styles.optionIcon}
          />
          <Text>Video</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postOption}>
          <Image
            source={require("../assets/icons/album.png")}
            style={styles.optionIcon}
          />
          <Text>Album</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.postOption}>
          <Image
            source={require("../assets/icons/memories.png")}
            style={styles.optionIcon}
          />
          <Text>Kỉ niệm</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <HeaderTimeline />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={() => (
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Bạn đã xem hết bài đăng hiện tại
              </Text>
            </View>
          )}
        />
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  createPostContainer: {
    padding: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  input: {
    fontSize: 16,
    flex: 1,
  },
  postOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 10,
    marginTop: 10,
  },
  postOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    gap: 5,
    borderRadius: 10,
    justifyContent: "center",
  },
  optionIcon: {
    width: 25,
    height: 25,
  },
  postContainer: {
    backgroundColor: "rgba(217, 217, 217, 0.25)",
    margin: 10,
    borderRadius: 10,
    padding: 10,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  timestamp: {
    color: "gray",
    fontSize: 12,
  },
  postContent: {
    fontSize: 16,
    paddingBottom: 10,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 40,
    paddingTop: 20,
    paddingBottom: 10,
  },
  action: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  icon: {
    width: 20,
    height: 20,
  },
  actionText: {
    fontSize: 16,
  },
  footer: {
    padding: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 16,
    opacity: 0.5,
  },
});

export default TimelineTab;
