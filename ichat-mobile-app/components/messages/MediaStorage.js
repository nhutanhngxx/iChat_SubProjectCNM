import React, { useState } from "react";
import {
  Text,
  View,
  SafeAreaView,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";

import { Tab } from "@rneui/themed";
import { TabView } from "@rneui/base";

import HeaderMediaStorage from "../header/HeaderMediaStorage";
import FilterButton from "../common/ButtonFilter";
import ImageTab from "../messages/media/Image";
import FileTab from "../messages/media/File";
import LinkTab from "../messages/media/Link";
import VoiceTab from "../messages/media/Voice";

const MediaStorage = () => {
  const [selectedFilter, setSelectedFilter] = useState("");
  const [index, setIndex] = useState(0);
  const layout = useWindowDimensions();

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <HeaderMediaStorage />

      {/* Filter buttons */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          padding: 10,
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
      <Tab
        value={index}
        onChange={setIndex}
        indicatorStyle={{
          backgroundColor: "#6166EE",
          width: "15%",
          marginHorizontal: "5%",
        }}
        variant="default"
        dense
      >
        <Tab.Item
          title="Hình ảnh"
          titleStyle={{
            color: index === 0 ? "#6166EE" : "gray",
            fontWeight: index === 0 ? "bold" : null,
          }}
        />
        <Tab.Item
          title="Tệp tin"
          titleStyle={{
            color: index === 1 ? "#6166EE" : "gray",
            fontWeight: index === 1 ? "bold" : null,
          }}
        />
        <Tab.Item
          title="Liên kết"
          titleStyle={{
            color: index === 2 ? "#6166EE" : "gray",
            fontWeight: index === 2 ? "bold" : null,
          }}
        />
        <Tab.Item
          title="Ghi âm"
          titleStyle={{
            color: index === 3 ? "#6166EE" : "gray",
            fontWeight: index === 3 ? "bold" : null,
          }}
        />
      </Tab>

      <TabView value={index} onChange={setIndex} animationType="spring">
        <TabView.Item style={{ width: "100%" }}>
          <ImageTab />
        </TabView.Item>
        <TabView.Item style={{ width: "100%" }}>
          <FileTab />
        </TabView.Item>
        <TabView.Item style={{ width: "100%" }}>
          <LinkTab />
        </TabView.Item>
        <TabView.Item style={{ width: "100%" }}>
          <VoiceTab />
        </TabView.Item>
      </TabView>
    </View>
  );
};

export default MediaStorage;
