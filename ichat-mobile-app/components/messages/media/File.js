import React, { useState } from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const FileTab = () => {
  const [files, setFiles] = useState([]);

  const renderFileItem = ({ item }) => (
    <TouchableOpacity style={styles.fileContainer}>
      <View style={styles.fileIconContainer}>
        <Image
          source={require("../../../assets/icons/close.png")}
          style={styles.fileIcon}
        />
      </View>
      <View style={styles.fileInfo}>
        <Text style={styles.fileName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.fileDetails}>
          <Text style={styles.fileSize}>{item.size}</Text>
          <Text style={styles.fileSender}>{item.sender}</Text>
          <Text style={styles.fileDate}>{item.date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Thống kê Tệp tin</Text>
        <Text style={styles.count}>{files.length} file</Text>
      </View>
      <FlatList
        data={files}
        renderItem={renderFileItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.fileList}
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
  fileList: {
    padding: 10,
  },
  fileContainer: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  fileIcon: {
    width: 30,
    height: 30,
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "500",
  },
  fileDetails: {
    flexDirection: "row",
    marginTop: 4,
    gap: 10,
  },
  fileSize: {
    fontSize: 12,
    color: "#666",
  },
  fileSender: {
    fontSize: 12,
    color: "#666",
  },
  fileDate: {
    fontSize: 12,
    color: "#666",
  },
});

export default FileTab;
