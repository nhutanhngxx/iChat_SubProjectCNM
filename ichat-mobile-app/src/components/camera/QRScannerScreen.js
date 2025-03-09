import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Camera } from "expo-camera";

const QRScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      console.log("Camera object: ", Camera); // Kiểm tra import
      console.log("Camera Constants: ", Camera?.Constants); // Kiểm tra lỗi undefined

      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");

      // Kiểm tra Camera.Constants trước khi sử dụng
      if (Camera?.Constants?.Type) {
        setCameraType(Camera.Constants.Type.back);
      } else {
        console.error("Camera.Constants is undefined!");
      }
    })();
  }, []);

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Đang kiểm tra quyền truy cập...</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>Ứng dụng cần quyền truy cập camera.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {cameraType ? (
        <Camera ref={cameraRef} style={styles.camera} type={cameraType} />
      ) : (
        <Text>Camera không khả dụng.</Text>
      )}
      <TouchableOpacity style={styles.scanAgainButton}>
        <Text style={styles.scanAgainText}>Quét lại</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  camera: { flex: 1, width: "100%" },
  scanAgainButton: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    backgroundColor: "#6166EE",
    padding: 10,
    borderRadius: 10,
  },
  scanAgainText: { color: "white", fontSize: 16 },
});

export default QRScannerScreen;
