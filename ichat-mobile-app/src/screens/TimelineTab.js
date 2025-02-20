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
} from "react-native";

import HeaderTimeline from "../components/header/HeaderTimeline";

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
      require("../assets/images/avatars/avatar1.png"),
      require("../assets/images/avatars/avatar1.png"),
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
    images: [],
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
      require("../assets/images/avatars/avatar3.png"),
      require("../assets/images/avatars/avatar3.png"),
      require("../assets/images/avatars/avatar3.png"),
    ],
    likes: 200,
    comments: 50,
  },
];

const TimelineTab = () => {
  const renderPost = ({ item }) => {
    return (
      <View
        style={{
          backgroundColor: "rgba(217, 217, 217, 0.25)",
          margin: 10,
          borderRadius: 10,
          padding: 10,
        }}
      >
        {/* Header post */}
        <View
          style={{
            paddingBottom: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              source={item.user.avatar}
              style={{ width: 50, height: 50, marginRight: 10 }}
            />
            <View style={{ gap: 5 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                {item.user.name}
              </Text>
              <Text style={{ color: "gray", fontSize: 12 }}>
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
          <Text style={{ fontSize: 16, paddingBottom: 10 }}>
            {item.content}
          </Text>

          {/* Hiển thị ảnh đăng */}
          {item.images.length > 0 && (
            <View style={{ marginTop: 10 }}>
              <FlatList
                data={item.images}
                horizontal
                keyExtractor={(image, index) => index.toString()}
                renderItem={({ item }) => (
                  <Image
                    source={item}
                    style={{
                      width: 100,
                      height: 100,
                      marginRight: 10,
                      borderRadius: 5,
                    }}
                    resizeMode="cover"
                  />
                )}
              />
            </View>
          )}
        </View>

        {/* Likes, Comments */}
        <View
          style={{
            flexDirection: "row",
            gap: 40,
            paddingTop: 20,
            paddingBottom: 10,
          }}
        >
          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <TouchableOpacity>
              <Image
                source={require("../assets/icons/heart-outline.png")}
                style={{ width: 20, height: 20 }}
              />
            </TouchableOpacity>
            <Text style={{ fontSize: 16 }}>Thích</Text>
            <Image
              source={require("../assets/icons/heart.png")}
              style={{ width: 20, height: 20 }}
            />
            <Text>{item.likes}</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <TouchableOpacity>
              <Image
                source={require("../assets/icons/comment.png")}
                style={{ width: 20, height: 20 }}
              />
            </TouchableOpacity>
            <Text>{item.likes}</Text>
          </View>
        </View>
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <HeaderTimeline />

      <View style={{ padding: 10, flexDirection: "row", gap: 15 }}>
        <Image
          source={require("../assets/images/avatars/avatar1.png")}
          style={{ width: 50, height: 50 }}
        />
        <TextInput
          style={{ fontSize: 16 }}
          placeholder="Hôm nay bạn cảm thấy thế nào?"
        />
      </View>

      <View
        style={{
          paddingHorizontal: 10,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            padding: 5,
            backgroundColor: "rgba(217, 217, 217, 0.5)",
            width: "100",
            borderRadius: 10,
          }}
        >
          <Image
            source={require("../assets/icons/image.png")}
            style={{ width: 30, height: 30 }}
          />
          <Text>Hình ảnh</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            padding: 5,
            backgroundColor: "rgba(217, 217, 217, 0.5)",
            width: "80",
            borderRadius: 10,
          }}
        >
          <Image
            source={require("../assets/icons/video.png")}
            style={{ width: 30, height: 30 }}
          />
          <Text>Video</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            padding: 5,
            backgroundColor: "rgba(217, 217, 217, 0.5)",
            width: "90",
            borderRadius: 10,
          }}
        >
          <Image
            source={require("../assets/icons/album.png")}
            style={{ width: 30, height: 30 }}
          />
          <Text>Album</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            padding: 5,
            backgroundColor: "rgba(217, 217, 217, 0.5)",
            width: "90",
            borderRadius: 10,
          }}
        >
          <Image
            source={require("../assets/icons/memories.png")}
            style={{ width: 30, height: 30 }}
          />
          <Text>Kỉ niệm</Text>
        </TouchableOpacity>
      </View>

      {/* Story */}
      <View></View>

      {/* All Post */}
      <View style={{ flex: 1 }}>
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item, index) => index.toString()}
          ListFooterComponent={() => (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={{ fontSize: 16, opacity: 0.5 }}>
                Bạn đã xem hết bài đăng hiện tại
              </Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});

export default TimelineTab;
