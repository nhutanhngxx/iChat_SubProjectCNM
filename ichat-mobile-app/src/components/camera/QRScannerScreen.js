import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
// import { BarCodeScanner } from "expo-barcode-scanner";

const QRScanner = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  //   useEffect(() => {
  //     (async () => {
  //       const { status } = await BarCodeScanner.requestPermissionsAsync();
  //       setHasPermission(status === "granted");
  //     })();
  //   }, []);
  //   const handleBarCodeScanned = ({ type, data }) => {
  //     setScanned(true);
  //     alert(`Mã QR đã quét: ${data}`);
  //     navigation.goBack(); // Đóng màn hình sau khi quét
  //   };
  //   if (hasPermission === null) {
  //     return <Text>Đang yêu cầu quyền truy cập camera...</Text>;
  //   }
  //   if (hasPermission === false) {
  //     return <Text>Không có quyền truy cập camera</Text>;
  //   }
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
    //     <BarCodeScanner
    //       onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
    //       style={{ flex: 1 }}
    //     />
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Camera</Text>
    </View>
  );
};

export default QRScanner;
