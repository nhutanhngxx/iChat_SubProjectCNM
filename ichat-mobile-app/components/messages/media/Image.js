import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const ImageTab = () => {
  const navigation = useNavigation();
  const [images, setImages] = useState([]);
  const windowWidth = Dimensions.get("window").width;

  // TODO: Fetch images from your API
  // useEffect(() => {
  //   const fetchImages = async () => {
  //     // Implement API call to get images
  //   };
  //   fetchImages();
  // }, []);

  const renderImageItem = ({ item }) => (
    <TouchableOpacity
      style={styles.imageContainer}
      onPress={() =>
        navigation.navigate("ViewImageChat", { imageUrl: item.url })
      }
    >
      <Image
        source={{ uri: item.url }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.imageInfo}>
        <Text style={styles.imageDate}>{item.date}</Text>
        <Text style={styles.imageSize}>{item.size}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Thống kê Hình ảnh</Text>
        <Text style={styles.count}>{images.length} ảnh</Text>
      </View>
      <FlatList
        data={images}
        renderItem={renderImageItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.imageList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  count: {
    color: "#666",
  },
  imageList: {
    padding: 5,
  },
  imageContainer: {
    flex: 1 / 3,
    aspectRatio: 1,
    margin: 1,
  },
  image: {
    flex: 1,
    borderRadius: 3,
  },
  imageInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 4,
  },
  imageDate: {
    color: "#fff",
    fontSize: 10,
  },
  imageSize: {
    color: "#fff",
    fontSize: 10,
  },
});

export default ImageTab;
