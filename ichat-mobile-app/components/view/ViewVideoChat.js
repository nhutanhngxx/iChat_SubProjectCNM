import React, { useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Video } from "expo-av";

import closeIcon from "../../assets/icons/close.png";

const ViewVideoChat = ({ route, navigation }) => {
  const { videoUrl } = route.params;
  const videoRef = React.useRef(null);

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
      <StatusBar hidden={false} style="light" />
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Image source={closeIcon} style={styles.icon} />
      </TouchableOpacity>

      <Video
        ref={videoRef}
        source={{ uri: videoUrl }}
        style={styles.video}
        useNativeControls
        resizeMode="contain"
        shouldPlay={true}
        isLooping={false}
        isMuted={false}
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
  video: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.4,
  },
});

export default ViewVideoChat;
