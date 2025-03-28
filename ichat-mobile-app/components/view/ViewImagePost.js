import React, { useEffect } from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";

import closeIcon from "../../assets/icons/close.png";

const ViewImagePost = ({ route, navigation }) => {
  const { imageUrl } = route.params;

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

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Image source={closeIcon} style={styles.icon} />
      </TouchableOpacity>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="contain"
      />
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
});

export default ViewImagePost;
