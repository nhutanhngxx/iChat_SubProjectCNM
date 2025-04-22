import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Text,
} from "react-native";
import { StatusBar } from "expo-status-bar";

import closeIcon from "../../assets/icons/close.png";

const ViewImageChat = ({ route, navigation }) => {
  const { imageUrl, images } = route.params;
  const [currentIndex, setCurrentIndex] = useState(
    images.findIndex((img) => img === imageUrl)
  );

  useEffect(() => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: "none" } });
    return () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: {
          backgroundColor: "white",
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
        },
      });
    };
  }, []);

  const handleScroll = (event) => {
    const slideWidth = event.nativeEvent.layoutMeasurement.width;
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / slideWidth);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={false} style="light" />
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Image source={closeIcon} style={styles.icon} />
      </TouchableOpacity>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        contentOffset={{
          x: currentIndex * Dimensions.get("window").width,
          y: 0,
        }}
      >
        {images.map((img, index) => (
          <Image
            key={index}
            source={{ uri: img }}
            style={[styles.image, { width: Dimensions.get("window").width }]}
            resizeMode="contain"
          />
        ))}
      </ScrollView>

      {images.length > 1 && (
        <View style={styles.pagination}>
          <Text style={styles.paginationText}>
            {currentIndex + 1}/{images.length}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
  },
  icon: {
    width: 30,
    height: 30,
    tintColor: "white",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  pagination: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 8,
    borderRadius: 15,
  },
  paginationText: {
    color: "white",
    fontSize: 14,
  },
});

export default ViewImageChat;
