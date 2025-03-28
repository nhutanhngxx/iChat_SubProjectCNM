import { CameraView, Camera } from "expo-camera";
import { useState, useRef, useEffect } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import * as MediaLibrary from "expo-media-library";
import Slider from "@react-native-community/slider";
import { StatusBar } from "expo-status-bar";

export default function CameraFunction() {
  const [cameraPermission, setCameraPermission] = useState(); // Trạng thái quyền truy cập camera
  const [mediaLibraryPermission, setMediaLibraryPermission] = useState(); // Trạng thái quyền truy cập thư viện ảnh
  const [micPermission, setMicPermission] = useState(); // Trạng thái quyền truy cập micro
  const [cameraMode, setCameraMode] = useState("picture"); // Chế độ camera: chụp ảnh hoặc quay video (mặc định là chụp ảnh)
  const [facing, setFacing] = useState("back"); // Hướng camera: trước hoặc sau (mặc định là camera sau)
  const [photo, setPhoto] = useState(); // Lưu ảnh sau khi chụp
  const [video, setVideo] = useState(); // Lưu video sau khi quay
  const [flashMode, setFlashMode] = useState("off"); // Chế độ đèn flash (mặc định tắt)
  const [recording, setRecording] = useState(false); // Trạng thái quay video (true khi đang quay)
  const [zoom, setZoom] = useState(0); // Mức độ thu phóng của camera
  let cameraRef = useRef(); // Tạo một tham chiếu đến camera
  const navigation = useNavigation(); // Hook để điều hướng giữa các màn hình

  // Khi màn hình được hiển thị lần đầu tiên, useEffect sẽ chạy và kiểm tra xem ứng dụng có quyền truy cập Camera, Microphone và Thư viện phương tiện hay không.
  useEffect(() => {
    (async () => {
      // Yêu cầu quyền truy cập Camera
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      // Yêu cầu quyền truy cập Thư viện phương tiện
      const mediaLibraryPermission =
        await MediaLibrary.requestPermissionsAsync();
      // Yêu cầu quyền truy cập Microphone
      const microphonePermission =
        await Camera.requestMicrophonePermissionsAsync();

      // Cập nhật trạng thái quyền truy cập
      setCameraPermission(cameraPermission.status === "granted");
      setMediaLibraryPermission(mediaLibraryPermission.status === "granted");
      setMicPermission(microphonePermission.status === "granted");
    })();
  }, []); // Chạy một lần duy nhất khi màn hình được hiển thị lần đầu tiên

  // Nếu quyền chưa được cấp, ứng dụng sẽ phải chờ cho đến khi quyền được cấp
  if (
    cameraPermission === undefined ||
    mediaLibraryPermission === undefined ||
    micPermission === undefined
  ) {
    return <Text>Đang yêu cầu quyền truy cập...</Text>;
  }
  // Nếu quyền camera không được cấp, hiển thị thông báo yêu cầu người dùng thay đổi trong cài đặt
  else if (!cameraPermission) {
    return (
      <Text>
        Quyền truy cập camera chưa được cấp. Vui lòng thay đổi trong cài đặt.
      </Text>
    );
  }

  // Hàm chuyển đổi giữa camera trước và sau
  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  // Hàm bật/tắt đèn flash
  function toggleFlash() {
    setFlashMode((current) => (current === "on" ? "off" : "on"));
  }

  // Hàm chụp ảnh
  let takePic = async () => {
    // Khai báo takePic là một hàm bất đồng bộ (async) để có thể sử dụng await.
    let options = {
      quality: 1, // Đặt chất lượng ảnh ở mức cao nhất (1 là tối đa, giá trị thấp hơn sẽ giảm chất lượng và dung lượng file).
      base64: true, // Chuyển đổi ảnh thành chuỗi Base64 để có thể nhúng trực tiếp vào dữ liệu hoặc tải lên server ngay lập tức.
      exif: false, // Không bao gồm dữ liệu EXIF (thông tin về thiết bị, vị trí, thời gian chụp...). Nếu đặt thành true, EXIF sẽ được đính kèm.
    };

    let newPhoto = await cameraRef.current.takePictureAsync(options);
    // Sử dụng tham chiếu camera (cameraRef) để gọi phương thức takePictureAsync().
    // Chụp ảnh với các tùy chọn đã đặt và trả về một đối tượng chứa thông tin ảnh như đường dẫn URI, chuỗi Base64 hoặc dữ liệu EXIF (nếu bật).

    setPhoto(newPhoto); // Lưu ảnh vào state để có thể hiển thị hoặc xử lý tiếp.
  };

  // Sau khi ảnh được chụp, nó sẽ được hiển thị cho người dùng.
  // Người dùng có thể chọn lưu ảnh hoặc hủy bỏ ảnh vừa chụp.
  if (photo) {
    let savePhoto = () => {
      MediaLibrary.saveToLibraryAsync(photo.uri).then(() => {
        setPhoto(undefined); // Xóa ảnh khỏi state sau khi lưu thành công.
      });
    };
    return (
      <View style={styles.imageContainer}>
        <StatusBar style="light" />
        {/* Hiển thị ảnh vừa chụp */}
        <Image style={styles.preview} source={{ uri: photo.uri }} />
        {/* Container chứa các nút thao tác */}
        <View style={styles.btnContainer}>
          {/* Nếu người dùng đã cấp quyền truy cập thư viện, hiển thị nút lưu ảnh */}
          {mediaLibraryPermission ? (
            <TouchableOpacity style={styles.btn} onPress={savePhoto}>
              <Ionicons name="save-outline" size={30} color="black" />
              <Text>Lưu ảnh vào máy</Text>
            </TouchableOpacity>
          ) : undefined}
          {/* Nút xóa ảnh (bấm vào sẽ hủy ảnh vừa chụp) */}
          <TouchableOpacity
            style={styles.btn}
            onPress={() => setPhoto(undefined)}
          >
            <Ionicons name="trash-outline" size={30} color="black" />
            <Text>Xóa ảnh</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Quay video
  async function recordVideo() {
    setRecording(true); // Cập nhật trạng thái đang quay video (true). Điều này cũng làm thay đổi nút quay thành nút dừng.
    cameraRef.current
      .recordAsync({
        // cameraRef là một useRef trỏ đến component Camera.
        // recordAsync() bắt đầu quay video và trả về một Promise chứa thông tin về video đã quay.
        maxDuration: 30, // Giới hạn thời gian quay tối đa là 30 giây. Sau 30 giây, quá trình quay sẽ tự động dừng.
      })
      .then((newVideo) => {
        // Khi quay xong, Promise sẽ trả về đối tượng newVideo chứa thông tin về video, bao gồm đường dẫn file (URI) và metadata.
        setVideo(newVideo); // Lưu thông tin video vào state để có thể phát lại, tải lên, hoặc thực hiện các thao tác khác.
        setRecording(false); // Cập nhật trạng thái quay video về false.
      });

    console.log(video.uri); // In ra đường dẫn video (có thể bị lỗi do state chưa cập nhật ngay lập tức).
  }

  function stopRecording() {
    setRecording(false);
    cameraRef.current.stopRecording();
    console.log("Recording stopped");
  }

  if (video) {
    let uri = video.uri;
    navigation.navigate("Video", { uri });
  }

  // Thiết kế giao diện máy ảnh
  return (
    <View style={styles.container}>
      <StatusBar hidden={false} style="light" />
      <CameraView
        style={styles.camera}
        facing={facing} // Chọn camera trước hoặc sau
        ref={cameraRef} // Gán tham chiếu đến camera
        flash={flashMode} // Chế độ flash (bật/tắt)
        mode={cameraMode} // Chế độ chụp ảnh hoặc quay video
        zoom={zoom} // Mức zoom hiện tại
      >
        {/* Nút quay lại */}
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 50,
            left: 10,
            borderRadius: 50,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={25} color="white" />
          <Text style={{ color: "white", fontSize: 18 }}>Quay lại</Text>
        </TouchableOpacity>

        {/* Thanh trượt để điều chỉnh mức zoom */}
        <Slider
          style={{
            // height: 50, // Chiều cao theo chiều dọc
            width: 200, // Độ rộng của thanh trượt
            position: "absolute",
            right: -80, // Đặt bên phải màn hình
            top: "40%", // Căn giữa theo chiều dọc
            transform: [{ rotate: "-90deg" }], // Xoay thanh trượt theo chiều dọc
          }}
          minimumValue={0} // Giá trị zoom nhỏ nhất
          maximumValue={1} // Giá trị zoom lớn nhất
          minimumTrackTintColor="cyan" // Màu thanh trượt khi thay đổi
          maximumTrackTintColor="white" // Màu thanh trượt tối đa
          value={zoom} // Giá trị hiện tại của zoom
          onValueChange={(value) => setZoom(value)} // Cập nhật giá trị zoom khi thay đổi
        />

        {/* Các nút điều khiển camera */}
        <View style={styles.buttonContainer}>
          {/* Nút chuyển đổi giữa camera trước và sau */}
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse-outline" size={20} color="white" />
          </TouchableOpacity>

          {/* Nút chuyển sang chế độ chụp ảnh */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => setCameraMode("picture")}
          >
            <Ionicons name="camera-outline" size={20} color="white" />
          </TouchableOpacity>

          {/* Nút chuyển sang chế độ quay video */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => setCameraMode("video")}
          >
            <Ionicons name="videocam-outline" size={20} color="white" />
          </TouchableOpacity>

          {/* Nút bật/tắt flash */}
          <TouchableOpacity style={styles.button} onPress={toggleFlash}>
            <Text>
              {flashMode === "on" ? (
                <Ionicons name="flash-outline" size={20} color="white" />
              ) : (
                <Ionicons name="flash-off-outline" size={20} color="white" />
              )}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Nút chụp ảnh hoặc quay video */}
        <View style={styles.shutterContainer}>
          {cameraMode === "picture" ? (
            // Nút chụp ảnh
            <TouchableOpacity style={styles.button} onPress={takePic}>
              <Ionicons name="aperture-outline" size={80} color="white" />
            </TouchableOpacity>
          ) : recording ? (
            // Nút dừng quay video nếu đang quay
            <TouchableOpacity style={styles.button} onPress={stopRecording}>
              <Ionicons name="stop-circle-outline" size={80} color="red" />
            </TouchableOpacity>
          ) : (
            // Nút bắt đầu quay video
            <TouchableOpacity style={styles.button} onPress={recordVideo}>
              <Ionicons name="play-circle-outline" size={80} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 20,
  },
  shutterContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    margin: 20,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  btnContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 20,
    paddingVertical: 5,
  },
  btn: {
    justifyContent: "center",
    margin: 10,
    elevation: 5,
    alignItems: "center",
    gap: 10,
  },
  imageContainer: {
    height: "95%",
    width: "100%",
    flex: 1,
  },
  preview: {
    alignSelf: "stretch",
    flex: 1,
    width: "auto",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
