import React, { useState } from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Linking,
} from "react-native";

const LinkTab = () => {
  const [links, setLinks] = useState([]);

  const handleOpenLink = (url) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      }
    });
  };

  const renderLinkItem = ({ item }) => (
    <TouchableOpacity
      style={styles.linkContainer}
      onPress={() => handleOpenLink(item.url)}
    >
      <View style={styles.linkIconContainer}>
        <Image
          source={require("../../../assets/icons/link.png")}
          style={styles.linkIcon}
        />
      </View>
      <View style={styles.linkInfo}>
        <Text style={styles.linkTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.linkUrl} numberOfLines={1}>
          {item.url}
        </Text>
        <View style={styles.linkDetails}>
          <Text style={styles.linkSender}>{item.sender}</Text>
          <Text style={styles.linkDate}>{item.date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Thống kê Liên kết</Text>
        <Text style={styles.count}>{links.length} link</Text>
      </View>
      <FlatList
        data={links}
        renderItem={renderLinkItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.linkList}
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
  linkList: {
    padding: 10,
  },
  linkContainer: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  linkIconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  linkIcon: {
    width: 24,
    height: 24,
  },
  linkInfo: {
    flex: 1,
    marginLeft: 12,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  linkUrl: {
    fontSize: 14,
    color: "#2980b9",
    marginTop: 2,
  },
  linkDetails: {
    flexDirection: "row",
    marginTop: 4,
    gap: 10,
  },
  linkSender: {
    fontSize: 12,
    color: "#666",
  },
  linkDate: {
    fontSize: 12,
    color: "#666",
  },
});

export default LinkTab;
