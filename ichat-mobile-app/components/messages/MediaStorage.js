import React, { useState } from "react";
import {
  Text,
  View,
  SafeAreaView,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";

import { TabView, TabBar } from "react-native-tab-view";

import HeaderMediaStorage from "../header/HeaderMediaStorage";
import FilterButton from "../common/ButtonFilter";
import ImageTab from "../messages/media/Image";
import FileTab from "../messages/media/File";
import LinkTab from "../messages/media/Link";
import VoiceTab from "../messages/media/Voice";
import { Colors } from "react-native/Libraries/NewAppScreen";

const MediaStorage = () => {
  const [selectedFilter, setSelectedFilter] = useState("");
  const [indexTab, setIndexTab] = useState(0);
  const layout = useWindowDimensions();

  const routes = [
    { key: "image", title: "Ảnh" },
    { key: "file", title: "File" },
    { key: "link", title: "Link" },
    { key: "voice", title: "Voice" },
  ];

  const renderScene = ({ route }) => {
    switch (route.key) {
      case "image":
        return indexTab === 0 ? <ImageTab /> : null;
      case "file":
        return indexTab === 1 ? <FileTab /> : null;
      case "link":
        return indexTab === 2 ? <LinkTab /> : null;
      case "voice":
        return indexTab === 3 ? <VoiceTab /> : null;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <HeaderMediaStorage />

      {/* Filter buttons */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          paddingVertical: 5,
          paddingBottom: 10,
        }}
      >
        <FilterButton
          title="Người gửi"
          icon={require("../../assets/icons/me.png")}
          isActive={selectedFilter === "Sender"}
          onPress={() => setSelectedFilter("Sender")}
        />
        <FilterButton
          title="Video"
          icon={require("../../assets/icons/video.png")}
          isActive={selectedFilter === "Video"}
          onPress={() => setSelectedFilter("Video")}
        />
        <FilterButton
          title="Thời gian"
          icon={require("../../assets/icons/timeline.png")}
          isActive={selectedFilter === "Time"}
          onPress={() => setSelectedFilter("Time")}
        />
      </View>

      {/* Tabs */}
      <TabView
        navigationState={{ index: indexTab, routes }}
        renderScene={renderScene}
        onIndexChange={setIndexTab}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            style={{ backgroundColor: "white" }} // Màu nền
            indicatorStyle={{ backgroundColor: "blue" }} // Thanh gạch dưới
            activeColor="blue" // Màu chữ khi tab được chọn
            inactiveColor="gray" // Màu chữ khi tab không được chọn
          />
        )}
      />
    </SafeAreaView>
  );
};

export default MediaStorage;
