import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as IntentLauncher from "expo-intent-launcher";
import * as Sharing from "expo-sharing";
import { StatusBar } from "expo-status-bar";
import * as Clipboard from "expo-clipboard";

import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../../config/context/UserContext";
import axios from "axios";
import messageService from "../../services/messageService";
import groupService from "../../services/groupService";
import MessageInputBar from "../../components/messages/MessageInputBar";

import { getHostIP } from "../../services/api";
import friendService from "../../services/friendService";
import socketService from "../../services/socketService";
import { Video, Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

import AudioRecorder from "./AudioRecorder";
import CallOverlay from "./CallOverlay";
import IncomingCallScreen from "./IncomingCallScreen";
import Constants from "expo-constants";
const renderReactionIcons = (reactions) => {
  const icons = {
    like: require("../../assets/icons/emoji-like.png"),
    love: require("../../assets/icons/emoji-love.png"),
    haha: require("../../assets/icons/emoji-haha.png"),
    wow: require("../../assets/icons/emoji-surprised.png"),
    sad: require("../../assets/icons/emoji-cry.png"),
    angry: require("../../assets/icons/emoji-angry.png"),
  };

  const counts = reactions.reduce((acc, r) => {
    acc[r.reaction_type] = (acc[r.reaction_type] || 0) + 1;
    return acc;
  }, {});

  return (
    <View style={styles.reactionsWrapper}>
      {Object.entries(counts).map(([type, count]) => (
        <View key={type} style={styles.reactionItem}>
          <Image source={icons[type]} style={{ width: 15, height: 15 }} />
        </View>
      ))}
    </View>
  );
};

const Chatting = ({ navigation, route }) => {
  const ipAdr = getHostIP();
  // const API_iChat = `http://${ipAdr}:5001/api/messages/`;
  const API_URL = Constants.expoConfig.extra.API_URL;

  const API_iChat = `${API_URL}/api/messages/`;
  const { user } = useContext(UserContext);
  const { chat } = route.params || {};
  const flatListRef = useRef(null); // "friend" | "not-friend" | "blocked" dùng để kiểm tra trạng thái bạn bè giữa 2 người dùng
  const [typeChat, setTypeChat] = useState(route.params?.typeChat || "friend");
  const [inputMessage, setInputMessage] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyMessage, setReplyMessage] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // console.log("Chatting: ", chat);

  // Thêm state để quản lý audio đang phát
  const [playingAudio, setPlayingAudio] = useState(null);
  const [audioStatus, setAudioStatus] = useState({});

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Thêm function xử lý audio
  const handlePlayAudio = async (audioUrl, messageId) => {
    try {
      // Kiểm tra và thiết lập Audio Mode nếu cần
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // Nếu đang phát audio khác, dừng nó lại
      if (playingAudio && playingAudio.messageId !== messageId) {
        try {
          await playingAudio.sound.stopAsync();
          await playingAudio.sound.unloadAsync();
        } catch (error) {
          console.log("Error stopping previous audio:", error);
        }
        setPlayingAudio(null);
      }

      // Nếu chưa có sound cho message này hoặc sound đã bị unload
      if (
        !audioStatus[messageId]?.sound ||
        audioStatus[messageId]?.sound._loaded === false
      ) {
        console.log("Creating new sound for:", audioUrl);

        const { sound, status } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          {
            shouldPlay: true,
            progressUpdateIntervalMillis: 100,
          },
          (status) => {
            // Callback khi status thay đổi
            setAudioStatus((prev) => ({
              ...prev,
              [messageId]: { ...prev[messageId], status },
            }));
          }
        );

        // Lưu sound mới
        setPlayingAudio({ messageId, sound });
        setAudioStatus((prev) => ({
          ...prev,
          [messageId]: { sound, isPlaying: true, status },
        }));

        // Xử lý khi audio kết thúc
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setAudioStatus((prev) => ({
              ...prev,
              [messageId]: { ...prev[messageId], isPlaying: false },
            }));
          }
        });
      } else {
        // Nếu đã có sound
        const currentSound = audioStatus[messageId].sound;
        const isPlaying = audioStatus[messageId].isPlaying;

        if (isPlaying) {
          console.log("Pausing audio");
          await currentSound.pauseAsync();
          setAudioStatus((prev) => ({
            ...prev,
            [messageId]: { ...prev[messageId], isPlaying: false },
          }));
        } else {
          console.log("Resuming audio");
          await currentSound.playAsync();
          setAudioStatus((prev) => ({
            ...prev,
            [messageId]: { ...prev[messageId], isPlaying: true },
          }));
        }
      }
    } catch (error) {
      console.error("Lỗi khi phát audio:", error);
      // Reset status nếu có lỗi
      setAudioStatus((prev) => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          isPlaying: false,
          sound: null,
        },
      }));
    }
  };

  // Thêm cleanup effect
  useEffect(() => {
    return () => {
      console.log("Cleaning up audio resources");
      Object.values(audioStatus).forEach(async (audio) => {
        if (audio?.sound) {
          try {
            await audio.sound.stopAsync();
            await audio.sound.unloadAsync();
          } catch (error) {
            console.log("Error cleaning up audio:", error);
          }
        }
      });
    };
  }, []);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      Object.values(audioStatus).forEach(async (audio) => {
        if (audio.sound) {
          await audio.sound.unloadAsync();
        }
      });
    };
  }, [audioStatus]);

  const [isInCall, setIsInCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callStatus, setCallStatus] = useState(null); // null | 'connecting' | 'ongoing' | 'outgoing'
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [ringtoneSound, setRingtoneSound] = useState(null);
  const [durationInterval, setDurationInterval] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);

  const playRingtone = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/sounds/thap-trap-tu-do.mp3"),
        { isLooping: true }
      );
      setRingtoneSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.error("Error playing ringtone:", error);
    }
  };

  const stopRingtone = async () => {
    if (ringtoneSound) {
      await ringtoneSound.stopAsync();
      await ringtoneSound.unloadAsync();
      setRingtoneSound(null);
    }
  };

  // Thêm state để theo dõi roomId của cuộc gọi hiện tại
  const [currentCallRoom, setCurrentCallRoom] = useState(null);

  const handleInitiateCall = async () => {
    if (chat.chatType !== "group" && chat.id === user.id) {
      Alert.alert("Thông báo", "Không thể gọi cho chính mình");
      return;
    }

    if (isInCall || callStatus) {
      Alert.alert("Thông báo", "Bạn đang trong một cuộc gọi khác");
      return;
    }

    const roomId = `audio_${Date.now()}`;
    console.log("[Chatting] Bắt đầu gọi tới:", chat.id);

    try {
      setCurrentCallRoom(roomId);
      setCallStatus("outgoing");
      setIsInCall(true);

      const callParams = {
        callerId: user.id,
        receiverId: chat.chatType === "private" ? chat.id : `group_${chat.id}`,
        roomId: roomId,
      };

      console.log("[Chatting] Gửi yêu cầu gọi với params:", callParams);

      const response = await socketService.initiateAudioCall(callParams);
      console.log("[Chatting] Phản hồi từ server:", response);
    } catch (error) {
      console.error("[Chatting] Lỗi khi gọi:", error);
      Alert.alert("Thông báo", error.message || "Không thể thực hiện cuộc gọi");
      endAudioCall();
    }
  };

  const handleAcceptCall = async () => {
    if (!incomingCall) return;

    const { callerId, roomId } = incomingCall;
    console.log(
      "[Chatting] Accepting call from:",
      callerId,
      "in room:",
      roomId
    );

    try {
      stopRingtone();
      setCallStatus("connecting");
      setCurrentCallRoom(roomId);

      // Accept call and wait for connection
      const connectionData = await socketService.acceptAudioCall(
        callerId,
        user.id,
        roomId
      );

      // If we get here, the call was connected successfully
      handleCallConnected(connectionData);
    } catch (error) {
      console.error("[Chatting] Error accepting call:", error);
      Alert.alert("Lỗi", "Không thể kết nối cuộc gọi. Vui lòng thử lại.");
      endAudioCall();
    }
  };

  // Xử lý khi cuộc gọi được kết nối thành công
  const handleCallConnected = useCallback(
    async ({ roomId }) => {
      try {
        // // Khởi tạo WebRTC connection
        // const configuration = {
        //   iceServers: [
        //     { urls: "stun:stun.l.google.com:19302" },
        //     // Thêm TURN server nếu cần
        //   ],
        // };
        // const peerConnection = new RTCPeerConnection(configuration);

        // // Thêm audio track
        // const stream = await navigator.mediaDevices.getUserMedia({
        //   audio: true,
        // });
        // stream.getTracks().forEach((track) => {
        //   peerConnection.addTrack(track, stream);
        // });

        // // Lắng nghe remote stream
        // peerConnection.ontrack = (event) => {
        //   const remoteStream = event.streams[0];
        //   // Phát remote audio stream
        //   playRemoteStream(remoteStream);
        // };

        // Bắt đầu đếm thời gian
        const interval = setInterval(() => {
          setCallDuration((prev) => prev + 1);
        }, 1000);
        setDurationInterval(interval);

        // Cập nhật trạng thái
        setCallStatus("ongoing");
        setIsInCall(true);
        setIncomingCall(null);

        console.log("[Chatting] Call successfully connected in room:", roomId);
      } catch (error) {
        console.error("[Chatting] Error setting up call:", error);
        Alert.alert("Lỗi", "Không thể thiết lập cuộc gọi. Vui lòng thử lại.");
        endAudioCall();
      }
    },
    [currentCallRoom, endAudioCall]
  );

  const handleRejectCall = (callerId, roomId) => {
    console.log(
      "[Chatting] Rejecting call from:",
      callerId,
      "in room:",
      roomId
    );
    stopRingtone();
    socketService.rejectAudioCall(user.id, callerId, roomId);
    setIncomingCall(null);
    setCallStatus(null);
  };

  // Hàm kết thúc cuộc gọi
  const endAudioCall = async () => {
    try {
      if (currentCallRoom) {
        socketService.endAudioCall(currentCallRoom);
      }

      // Cleanup WebRTC
      // if (peerConnection) {
      //   peerConnection.close();
      //   setPeerConnection(null);
      // }

      // Dừng đếm thời gian
      if (durationInterval) {
        clearInterval(durationInterval);
        setDurationInterval(null);
      }

      // Reset audio mode
      // await Audio.setAudioModeAsync({
      //   allowsRecordingIOS: false,
      //   playsInSilentModeIOS: true,
      //   staysActiveInBackground: false,
      //   shouldDuckAndroid: false,
      // });

      // Reset states
      setCallStatus(null);
      setCallDuration(0);
      setIsInCall(false);
      setIsMuted(false);
      setCurrentCallRoom(null);
      setIncomingCall(null);
      // await stopRingtone();
    } catch (error) {
      console.error("[Chatting] Error ending call:", error);
    }
  };

  const handleToggleMute = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: true,
        allowsRecordingAndroid: !isMuted,
      });
      setIsMuted(!isMuted);
      console.log("[Chatting] Microphone muted:", !isMuted);
    } catch (error) {
      console.error("Error toggling mute:", error);
    }
  };

  // Kiểm tra trạng thái chặn giữa 2 người dùng
  const [blockStatus, setBlockStatus] = useState({
    isBlocked: false,
    blockedByTarget: false,
    blockedByUser: false,
  });

  // Thêm state ở đầu component
  const [downloadingFiles, setDownloadingFiles] = useState({}); // { messageId: progress }
  const [downloadResumables, setDownloadResumables] = useState({}); // { messageId: downloadResumable }

  // Thêm useEffect để quản lý socket connection và events
  useEffect(() => {
    if (!user?.id || !chat?.id) return;

    let roomId;
    if (chat.chatType === "group") {
      roomId = `group_${chat.id}`;
      console.log("Joining group room:", roomId);
    } else {
      const userIds = [user.id, chat.id].sort();
      roomId = `chat_${userIds[0]}_${userIds[1]}`;
      console.log("Joining private chat room:", roomId);
    }

    socketService.connect();
    socketService.registerUser(user.id);

    // Join room
    socketService.joinRoom(roomId);

    // Lắng nghe tin nhắn mới
    socketService.onReceiveMessage((data) => {
      console.log("Received new message:", data);
      if (data.chatId === roomId) {
        setMessages((prevMessages) => {
          // Kiểm tra tin nhắn đã tồn tại chưa
          const messageExists = prevMessages.some(
            (msg) => msg._id === data._id
          );
          if (!messageExists) {
            return [...prevMessages, data];
          }
          return prevMessages;
        });
      }
    });

    // Gửi tin nhắn
    socketService.handleSendMessage((messageData, roomId) => {
      console.log("Sending message:", messageData);
      socketService.handleSendMessage(messageData, roomId);
    });

    socketService.handleRecallMessage((data) => {
      console.log("Recalled message event received:", data);
      if (data.chatId === roomId) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) => (msg._id === data.messageId ? data : msg))
        );
      }
    });

    // Thêm listener cho việc nhận nhiều ảnh
    socketService.onReceiveMultipleImages((data) => {
      if (data.chatId === roomId) {
        setMessages((prevMessages) => {
          const newMessages = data.messages.filter(
            (newMsg) => !prevMessages.some((msg) => msg._id === newMsg._id)
          );
          return [...prevMessages, ...newMessages];
        });
      }
    });

    // Theo dõi tiến trình upload ảnh
    socketService.handleImageUploadProgress((progress) => {
      console.log("Upload progress:", progress);
      // Có thể thêm logic hiển thị progress bar ở đây
    });

    // Xử lý lỗi upload ảnh
    socketService.handleImageUploadError((error) => {
      console.error("Upload error:", error);
      Alert.alert("Lỗi", "Không thể tải ảnh lên. Vui lòng thử lại.");
    });

    // Lắng nghe cuộc gọi đến
    socketService.onIncomingAudioCall(({ callerId, roomId }) => {
      setCallStatus("incoming");
      setIncomingCall({ callerId, roomId });
    });

    // Thêm handler cho sự kiện hủy cuộc gọi
    socketService.onCallCancelled(({ roomId }) => {
      console.log("====> [Chatting] Call cancelled for room:", roomId);
      stopRingtone();
      setIncomingCall(null);
      setCallStatus(null);
      Alert.alert("Xin lỗi", "Cuộc gọi đã bị hủy từ người gọi!");
    });

    // Lắng nghe cuộc gọi bị từ chối
    socketService.onAudioCallRejected(({ callerId, receiverId, roomId }) => {
      Alert.alert("Xin lỗi", "Cuộc gọi đã bị từ chối bởi người nhận");
      console.log("[Chatting] Call rejected event:", {
        callerId,
        receiverId,
        roomId,
      });
      endAudioCall();
    });

    socketService.onAudioCallEnded(({ roomId }) => {
      if (currentCallRoom === roomId) {
        endAudioCall();
      }
    });

    // Lắng nghe cuộc gọi được chấp nhận
    socketService.onCallConnected(handleCallConnected);

    // Thêm listener cho trạng thái kết nối cuộc gọi
    socketService.onCallConnectionStatus((status) => {
      if (!status.connected && callStatus === "connecting") {
        Alert.alert("Lỗi", status.error || "Không thể kết nối cuộc gọi");
        endAudioCall();
      }
    });

    // Cleanup function
    return () => {
      console.log("Leaving room:", roomId);
      socketService.leaveRoom(roomId);
      socketService.removeAllListeners();
      socketService.disconect();
      socketService.endAudioCall();
      socketService.offCallConnected();
      stopRingtone();
      socketService.socket?.off("call-connection-status");
    };
  }, [user?.id, chat?.id]);

  // Thêm useEffect để lắng nghe sự kiện mất kết nối
  useEffect(() => {
    const handleDisconnect = () => {
      if (isInCall) {
        Alert.alert("Mất kết nối", "Cuộc gọi đã bị ngắt do mất kết nối");
        endAudioCall();
      }
    };

    socketService.socket?.on("disconnect", handleDisconnect);

    return () => {
      socketService.socket?.off("disconnect", handleDisconnect);
    };
  }, [isInCall]);

  const saveFileName = (url) => {
    // Tách URL theo dấu '/' và lấy phần cuối cùng
    const fileName = url.split("/").pop();

    // Tách tên file theo dấu '-'
    const parts = fileName.split("-");

    // Loại bỏ các phần không cần thiết (mã ID, timestamp)
    parts.shift(); // Loại bỏ mã ID (như: "3fag")
    parts.shift(); // Loại bỏ timestamp (như: "1744646086633")

    // Nối lại các phần còn lại để lấy tên file đầy đủ
    return parts.join("-");
  };

  const getFileNameFromUrl = (url, maxLength = 30) => {
    // Tách URL theo dấu '/' và lấy phần cuối cùng
    const fileName = url.split("/").pop();

    // Tách tên file theo dấu '-'
    const parts = fileName.split("-");

    // Loại bỏ các phần không cần thiết (mã ID, timestamp)
    parts.shift(); // Bỏ mã ID
    parts.shift(); // Bỏ timestamp

    // Nối lại phần còn lại để được tên gốc
    let finalName = parts.join("-");

    // Nếu tên dài hơn maxLength thì rút gọn lại, giữ đầu và đuôi
    if (finalName.length > maxLength) {
      const keep = Math.floor((maxLength - 3) / 2); // Trừ 3 cho dấu "..."
      const start = finalName.slice(0, keep);
      const end = finalName.slice(-keep);
      finalName = `${start}...${end}`;
    }

    return finalName;
  };

  // Hàm chọn tệp từ thiết bị
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      console.log("Đã chọn tệp:", result);

      if (result.assets !== null) {
        const file = {
          uri: result.assets[0].uri,
          name: result.assets[0].name,
          type: result.assets[0].mimeType || "application/octet-stream",
          size: result.assets[0].size,
        };
        setSelectedFile(file);
        console.log("File: ", file);
      }
    } catch (err) {
      console.error("Lỗi khi chọn tệp:", err);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi chọn tệp.");
    }
  };

  // Hàm chọn ảnh từ thư viện
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true, // Cho phép chọn nhiều ảnh
        quality: 0.8,
      });

      if (!result.canceled) {
        // Lấy tất cả URI của ảnh đã chọn
        const newImages = result.assets.map((asset) => asset.uri);
        setSelectedImages((prev) => [...prev, ...newImages]);
      }
    } catch (error) {
      console.error("Error picking images:", error);
      Alert.alert("Lỗi", "Không thể chọn ảnh.");
    }
  };

  const pickVideo = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Quyền truy cập bị từ chối",
          "Vui lòng cấp quyền truy cập thư viện ảnh để chọn video."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets[0]) {
        const videoAsset = result.assets[0];
        const videoSize = await FileSystem.getInfoAsync(videoAsset.uri);
        const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

        if (videoSize.size > MAX_VIDEO_SIZE) {
          Alert.alert(
            "Video quá lớn",
            "Vui lòng chọn video có kích thước nhỏ hơn 50MB"
          );
          return;
        }

        // Xác định MIME type từ uri
        const mimeType = getMimeType(videoAsset.uri);

        // Kiểm tra định dạng video hợp lệ
        if (!isValidVideoType(mimeType)) {
          Alert.alert(
            "Định dạng không hỗ trợ",
            "Vui lòng chọn video định dạng MP4, MOV, AVI hoặc WMV"
          );
          return;
        }

        // Tạo tên file với đúng phần mở rộng
        const extension = videoAsset.uri.split(".").pop().toLowerCase();
        const fileName = `video-${Date.now()}.${extension}`;

        const videoFile = {
          uri: videoAsset.uri,
          type: mimeType,
          name: fileName,
          size: videoSize.size,
          duration: videoAsset.duration,
        };

        setSelectedVideo(videoFile);
      }
    } catch (error) {
      console.error("Lỗi khi chọn video:", error);
      Alert.alert("Lỗi", "Không thể chọn video. Vui lòng thử lại.");
    }
  };

  const getMimeType = (uri) => {
    // Lấy phần mở rộng từ uri
    const extension = uri.split(".").pop().toLowerCase();

    // Map các định dạng phổ biến
    const mimeMap = {
      mp4: "video/mp4",
      mov: "video/quicktime",
      avi: "video/x-msvideo",
      wmv: "video/x-ms-wmv",
    };

    return mimeMap[extension] || "video/mp4"; // Mặc định là mp4 nếu không xác định được
  };

  const isValidVideoType = (mimeType) => {
    const validTypes = [
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/x-ms-wmv",
    ];
    return validTypes.includes(mimeType);
  };

  // Hàm lấy tên thành viên từ ID để hiển thị trên tin nhắn nhóm
  const getMemberName = useCallback(
    (memberId) => {
      const member = groupMembers.find((m) => m.user_id === memberId);
      return member?.full_name || "Unknown";
    },
    [groupMembers]
  );

  // Hiển thị modal khi ấn giữ tin nhắn
  const handleLongPress = (message) => {
    setSelectedMessage(message);
    setModalVisible(true);
  };

  // Copy tin nhắn
  const handleCopyMessage = () => {
    Clipboard.setString(selectedMessage?.content);
    setModalVisible(false);
  };

  // Thu hồi tin nhắn (Xóa nội dung tin nhắn đã gửi)
  const handleRecallMessage = async () => {
    const userIds = [user.id, chat.id].sort();
    const roomId = `chat_${userIds[0]}_${userIds[1]}`;
    if (!selectedMessage) return;

    if (typeChat === "not-friend" || typeChat === "blocked") {
      let message = "Bạn không thể gửi tin nhắn trong cuộc trò chuyện này.";

      if (typeChat === "blocked") {
        if (blockStatus.blockedByTarget) {
          message = `Bạn không thể gửi tin nhắn cho ${chat.name} vì bạn đã bị chặn.`;
        } else if (blockStatus.blockedByUser) {
          message = `Bạn không thể gửi tin nhắn cho ${chat.name} vì bạn đã chặn người này.`;
        }
      }

      Alert.alert("Thông báo", message);
      return;
    }

    try {
      const response = await axios.put(
        `${API_iChat}/recall/${selectedMessage._id}`,
        {
          userId: user.id,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.data) {
        const recalledMessage = {
          ...response.data.data,
          chatId: roomId,
        };
        console.log(socketService.handleRecallMessage(recalledMessage));

        socketService.handleSendMessage(recalledMessage);
      }
    } catch (error) {
      Alert.alert("Thông báo", "Tin nhắn này không thể thu hồi.");
    } finally {
      setModalVisible(false);
    }
  };

  const handleReaction = async (reactionType) => {
    const userIds = [user.id, chat.id].sort();
    const roomId = `chat_${userIds[0]}_${userIds[1]}`;

    if (!selectedMessage) return;

    if (typeChat !== "not-friend") {
      try {
        const response = await messageService.addReaction(
          selectedMessage._id,
          user.id,
          reactionType
        );

        console.log("Phản hồi từ server:", response.updatedMessage);
        // console.log("Room: ", roomId);

        if (response.updatedMessage) {
          socketService.handleAddReaction({
            chatId: roomId,
            messageId: selectedMessage._id,
            userId: user.id,
            reaction: reactionType,
          });
        }

        // if (response?.updatedMessage) {
        //   // Cập nhật lại toàn bộ object message theo kết quả từ server
        //   setMessages((prevMessages) =>
        //     prevMessages.map((msg) =>
        //       msg._id === selectedMessage._id ? response.updatedMessage : msg
        //     )
        //   );
        // }
      } catch (error) {
        console.error("Lỗi khi gửi reaction:", error);
        Alert.alert("Lỗi", "Không thể gửi reaction.");
      } finally {
        setModalVisible(false);
      }
    } else {
      Alert.alert(
        "Thông báo",
        "Bạn không thể gửi reaction trong cuộc trò chuyện này."
      );
      setModalVisible(false);
    }
  };

  // Load tin nhắn trò chuyện
  if (chat?.chatType === "private") {
    useEffect(() => {
      if (chat?.id && user?.id) {
        const fetchMessages = async () => {
          try {
            const response = await messageService.getPrivateMessages({
              userId: user.id,
              chatId: chat.id,
            });
            // Lọc tin nhắn trước khi set state
            const filteredMessages = response.filter((message) => {
              // Nếu không có mảng isdelete hoặc mảng rỗng thì hiển thị tin nhắn
              if (
                !Array.isArray(message.isdelete) ||
                message.isdelete.length === 0
              ) {
                return true;
              }
              // Không hiển thị tin nhắn nếu id người dùng nằm trong mảng isdelete
              return !message.isdelete.some(
                (id) => id === user.id || id === String(user.id)
              );
            });
            setMessages(filteredMessages);
          } catch (error) {
            console.error("Lỗi khi lấy tin nhắn:", error);
          }
        };
        fetchMessages();
        const interval = setInterval(fetchMessages, 500);
        return () => clearInterval(interval);
      }
    }, [user, chat]);
  } else {
    useEffect(() => {
      const fetchMessages = async () => {
        try {
          const messages = await messageService.getMessagesByGroupId(chat.id);
          const members = await groupService.getGroupMembers(chat.id);

          // Lọc tin nhắn đã bị xóa
          const filteredMessages = messages.filter((message) => {
            if (
              !Array.isArray(message.isdelete) ||
              message.isdelete.length === 0
            ) {
              return true;
            }
            return !message.isdelete.some(
              (id) => id === user.id || id === String(user.id)
            );
          });

          setMessages(filteredMessages);
          setGroupMembers(members);
        } catch (error) {
          console.error("Lỗi khi lấy tin nhắn nhóm:", error);
        }
      };
      fetchMessages();
      const interval = setInterval(fetchMessages, 500);
      return () => clearInterval(interval);
    }, [user, chat]);
  }

  // Click vào để reply
  const handleReply = (selectedMessage) => {
    console.log("Reply message:", selectedMessage);

    setReplyMessage(selectedMessage);
    setModalVisible(false); // Ẩn modal sau khi chọn reply
  };

  // Tắt Tabbar ngay sau khi vào màn hình Chatting
  useEffect(() => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: "none" } });
    return () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: {
          backgroundColor: "white",
          height: 0,
        },
      });
    };
  }, []);

  useEffect(() => {
    if (route.params?.typeChat) {
      setTypeChat(route.params.typeChat);
    }
  }, [route.params?.typeChat]);

  // Kiểm tra trạng thái chặn giữa 2 người dùng
  useEffect(() => {
    const checkIfBlocked = async () => {
      if (chat?.id && user?.id && chat.chatType === "private") {
        try {
          const status = await friendService.checkBlockStatus(user.id, chat.id);
          setBlockStatus(status);

          // Nếu người dùng bị chặn, thay đổi typeChat
          if (status.isBlocked) {
            // Cập nhật typeChat thành "blocked"
            setTypeChat("blocked");
          }
        } catch (error) {
          console.error("Lỗi kiểm tra trạng thái chặn:", error);
        }
      }
    };

    checkIfBlocked();
  }, [chat, user]);

  const sendMessage = async () => {
    if (!socketService.connect()) {
      Alert.alert("Thông báo", "Đang kết nối lại với server...");
      return;
    }

    // Kiểm tra trạng thái trò chuyện
    if (typeChat === "not-friend" || typeChat === "blocked") {
      let message = "Bạn không thể gửi tin nhắn trong cuộc trò chuyện này.";
      if (typeChat === "blocked") {
        if (blockStatus.blockedByTarget) {
          message = `Bạn không thể gửi tin nhắn cho ${chat.name} vì bạn đã bị chặn.`;
        } else if (blockStatus.blockedByUser) {
          message = `Bạn không thể gửi tin nhắn cho ${chat.name} vì bạn đã chặn người này.`;
        }
      }
      Alert.alert("Thông báo", message);
      return;
    }

    try {
      let roomId;
      if (chat.chatType === "group") {
        roomId = `group_${chat.id}`;
        console.log("Joining group room:", roomId);
      } else {
        const userIds = [user.id, chat.id].sort();
        roomId = `chat_${userIds[0]}_${userIds[1]}`;
        console.log("Joining private chat room:", roomId);
      }

      // Gửi tin nhắn văn bản hoặc reply
      if (inputMessage.trim() || replyMessage) {
        const textMessage = {
          sender_id: user.id,
          receiver_id: chat.id,
          content: inputMessage.trim() || replyMessage.content,
          type: "text",
          chat_type: chat?.chatType === "group" ? "group" : "private",
          reply_to: replyMessage?._id || null,
        };

        const apiEndpoint = replyMessage
          ? `${API_iChat}/reply`
          : `${API_iChat}/send-message`;

        const textResponse = await axios.post(apiEndpoint, textMessage);

        if (textResponse.data.data) {
          const messageToSend = {
            ...textResponse.data.data,
            chatId: roomId,
          };
          socketService.handleSendMessage(messageToSend);
        }

        setInputMessage("");
        setReplyMessage(null);
      }

      // Gửi hình ảnh
      if (selectedImages.length > 0) {
        const formData = new FormData();
        const groupId = Date.now().toString();

        selectedImages.forEach((uri, index) => {
          const filename = uri.split("/").pop();
          const match = /\.(\w+)$/.exec(filename ?? "");
          const ext = match ? match[1] : "jpg";

          formData.append("images", {
            uri: uri,
            name: `photo-${Date.now()}-${index}.${ext}`,
            type: `image/${ext}`,
          });
        });

        formData.append("sender_id", user.id);
        formData.append("receiver_id", chat.id);
        formData.append(
          "chat_type",
          chat?.chatType === "group" ? "group" : "private"
        );
        formData.append("group_id", groupId);
        formData.append("total_images", selectedImages.length.toString());

        const response = await axios.post(
          `${API_iChat}/send-multiple-images`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Accept: "application/json",
            },
          }
        );

        if (response.data.data) {
          response.data.data.forEach((message) => {
            const messageToSend = {
              ...message,
              chatId: roomId,
              group_id: groupId, // Thêm group_id vào message
              total_images: selectedImages.length, // Thêm tổng số ảnh
              is_group_images: true, // Đánh dấu là ảnh nhóm
            };
            socketService.handleSendMultipleImages(messageToSend);
          });
        }

        setSelectedImages([]);
      }

      // Gửi file
      if (selectedFile) {
        const fileFormData = new FormData();

        fileFormData.append("file", {
          uri: selectedFile.uri,
          name: selectedFile.name || `file-${Date.now()}`,
          type: selectedFile.type || "application/octet-stream",
        });

        fileFormData.append("sender_id", user.id);
        fileFormData.append("receiver_id", chat.id);
        fileFormData.append("type", "file");
        fileFormData.append(
          "chat_type",
          chat?.chatType === "group" ? "group" : "private"
        );

        const uploadResponse = await axios.post(
          `${API_iChat}/send-message`,
          fileFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Accept: "application/json",
            },
          }
        );

        if (uploadResponse.data.data) {
          const messageToSend = {
            ...uploadResponse.data.data,
            chatId: roomId,
          };
          socketService.handleSendMessage(messageToSend);
        }

        setSelectedFile(null);
      }

      // Gửi video
      if (selectedVideo) {
        setIsUploading(true);
        setUploadProgress(0);

        const videoFormData = new FormData();
        const mimeType = getMimeType(selectedVideo.uri);

        if (!isValidVideoType(mimeType)) {
          Alert.alert(
            "Lỗi",
            "Định dạng video không được hỗ trợ. Vui lòng chọn video khác."
          );
          setSelectedVideo(null);
          return;
        }

        videoFormData.append("video", {
          uri: selectedVideo.uri,
          name: selectedVideo.name || "video.mp4",
          type: mimeType,
        });

        videoFormData.append("sender_id", user.id);
        videoFormData.append("receiver_id", chat.id);
        videoFormData.append("type", "video");
        videoFormData.append(
          "chat_type",
          chat?.chatType === "group" ? "group" : "private"
        );

        try {
          const uploadResponse = await axios.post(
            `${API_iChat}/send-message`,
            videoFormData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Accept: "application/json",
              },
              onUploadProgress: (progressEvent) => {
                const progress = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setUploadProgress(progress);
              },
            }
          );

          if (uploadResponse.data.data) {
            const messageToSend = {
              ...uploadResponse.data.data,
              chatId: roomId,
            };
            socketService.handleSendMessage(messageToSend);
          }
        } catch (error) {
          console.error("Lỗi khi gửi video:", error);
          Alert.alert("Lỗi", "Không thể gửi video. Vui lòng thử lại.");
        } finally {
          setIsUploading(false);
          setSelectedVideo(null);
          setUploadProgress(0);
        }
      }

      // Gửi audio
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn/hình ảnh/file:", error);
      Alert.alert(
        "Lỗi",
        error.response?.data?.message ||
          error.message ||
          "Không thể gửi tin nhắn hoặc tệp. Vui lòng thử lại."
      );
    }
  };

  const handleForwardMessage = async () => {
    if (typeChat === "not-friend" || typeChat === "blocked") {
      let message =
        "Bạn không thể chuyển tiếp tin nhắn trong cuộc trò chuyện này.";

      if (typeChat === "blocked") {
        if (blockStatus.blockedByTarget) {
          message = `Bạn không thể chuyển tiếp tin nhắn vì bạn đã bị chặn.`;
        } else if (blockStatus.blockedByUser) {
          message = `Bạn không thể chuyển tiếp tin nhắn vì bạn đã chặn người này.`;
        }
      }

      Alert.alert("Thông báo", message);
      return;
    }

    navigation.navigate("ForwardMessage", {
      message: selectedMessage,
    });

    setModalVisible(false);
  };

  // Hanlde xóa mềm - xóa tin nhắn 1 phía
  const handleSoftDelete = async () => {
    if (typeChat === "not-friend" || typeChat === "blocked") {
      let message = "Bạn không thể xóa tin nhắn trong cuộc trò chuyện này.";

      if (typeChat === "blocked") {
        if (blockStatus.blockedByTarget) {
          message = `Bạn không thể xóa tin nhắn vì bạn đã bị chặn.`;
        } else if (blockStatus.blockedByUser) {
          message = `Bạn không thể xóa tin nhắn vì bạn đã chặn người này.`;
        }
      }

      Alert.alert("Thông báo", message);
      return;
    }
    try {
      const isLastMessage =
        selectedMessage._id === messages[messages.length - 1]._id;
      const response = await messageService.softDeleteMessagesForUser(
        user.id,
        selectedMessage._id
      );
      if (response.data !== null) {
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg._id !== selectedMessage._id)
        );
      }
    } catch (error) {
      console.error("Lỗi khi xóa mềm tin nhắn:", error);
    } finally {
      setModalVisible(false);
    }
  };

  // Gửi lời mời kết bạn
  const handleSendFriendRequest = async (chatId) => {
    try {
      const response = await friendService.sendFriendRequest({
        senderId: user.id,
        receiverId: chatId,
      });
      if (response.status === "ok") {
        Alert.alert("Thông báo", "Đã gửi lời mời kết bạn thành công.", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Home", { screen: "Messages" }),
          },
        ]);
      } else {
        Alert.alert("Thông báo", response.message);
      }
    } catch (error) {
      console.error("Lỗi khi gửi lời mời kết bạn:", error);
      Alert.alert("Lỗi", "Không thể gửi lời mời kết bạn.");
    }
  };

  // Hủy chặn
  const handleUnblockUser = async (chatId) => {
    Alert.alert(
      "Xác nhận",
      `Bạn có chắc chắn muốn hủy chặn ${chat.name} không?`,
      [
        { text: "Hủy" },
        {
          text: "Xác nhận",
          onPress: async () => {
            try {
              const response = await friendService.unblockUser({
                userId: user.id,
                blockedUserId: chatId,
              });
              if (response.status === "ok") {
                setBlockStatus((prev) => ({
                  ...prev,
                  // isBlocked: false,
                  // blockedByTarget: false,
                  blockedByUser: false,
                }));
                setTypeChat("not-friend"); // Cập nhật lại trạng thái chat
              } else {
                Alert.alert("Lỗi", response.message);
              }
            } catch (error) {
              console.error("Lỗi khi hủy chặn:", error);
            }
          },
        },
      ]
    );
  };

  const GroupImagesMessage = ({
    message,
    messages,
    navigation,
    isMyMessage,
  }) => {
    // Lấy tất cả ảnh trong cùng một nhóm
    const groupImages = messages.filter(
      (msg) => msg.group_id === message.group_id && msg.type === "image"
    );

    // Chỉ hiển thị nhóm ảnh cho tin nhắn đầu tiên trong nhóm
    if (message._id !== groupImages[0]._id) {
      return null;
    }

    const renderImages = () => {
      switch (groupImages.length) {
        case 1:
          return (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("ViewImageChat", {
                  imageUrl: groupImages[0].content,
                  images: groupImages.map((img) => img.content),
                })
              }
            >
              <Image
                source={{ uri: groupImages[0].content }}
                style={styles.singleGroupImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          );

        case 2:
          return (
            <View style={styles.twoImagesContainer}>
              {groupImages.map((img, index) => (
                <TouchableOpacity
                  key={img._id}
                  onPress={() =>
                    navigation.navigate("ViewImageChat", {
                      imageUrl: img.content,
                      images: groupImages.map((img) => img.content),
                    })
                  }
                  style={[
                    styles.twoImagesItem,
                    index === 0 ? { marginRight: 2 } : null,
                  ]}
                >
                  <Image
                    source={{ uri: img.content }}
                    style={styles.twoImagesImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          );

        default:
          return (
            <View style={styles.multipleImagesContainer}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("ViewImageChat", {
                    imageUrl: groupImages[0].content,
                    images: groupImages.map((img) => img.content),
                  })
                }
                style={styles.mainImageContainer}
              >
                <Image
                  source={{ uri: groupImages[0].content }}
                  style={styles.mainImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
              <View style={styles.smallImagesContainer}>
                {groupImages.slice(1, 3).map((img, index) => (
                  <TouchableOpacity
                    key={img._id}
                    onPress={() =>
                      navigation.navigate("ViewImageChat", {
                        imageUrl: img.content,
                        images: groupImages.map((img) => img.content),
                      })
                    }
                    style={[
                      styles.smallImageItem,
                      index === 0 ? { marginBottom: 2 } : null,
                    ]}
                  >
                    <Image
                      source={{ uri: img.content }}
                      style={styles.smallImage}
                      resizeMode="cover"
                    />
                    {index === 1 && groupImages.length > 3 && (
                      <View style={styles.remainingCountOverlay}>
                        <Text style={styles.remainingCountText}>
                          +{groupImages.length - 3}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
      }
    };

    return (
      <View
        style={[
          styles.groupImagesWrapper,
          isMyMessage ? styles.myGroupImages : styles.theirGroupImages,
        ]}
      >
        {renderImages()}
      </View>
    );
  };

  const handleFileDownload = async (fileUrl, messageId) => {
    try {
      setDownloadingFiles((prev) => ({ ...prev, [messageId]: 0 }));

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Cần quyền truy cập",
          "Ứng dụng cần quyền truy cập để lưu file"
        );
        return;
      }

      // Lấy tên file từ URL
      const fileName = decodeURIComponent(saveFileName(fileUrl));
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      const downloadResumable = FileSystem.createDownloadResumable(
        fileUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          setDownloadingFiles((prev) => ({ ...prev, [messageId]: progress }));
        }
      );

      // Lưu downloadResumable object
      setDownloadResumables((prev) => ({
        ...prev,
        [messageId]: downloadResumable,
      }));

      const { uri } = await downloadResumable.downloadAsync();

      // Xử lý file sau khi tải xong
      if (Platform.OS === "ios") {
        // Trên iOS, lưu vào Photos nếu là ảnh/video, mở với QuickLook cho các file khác
        const fileExtension = fileName.split(".").pop().toLowerCase();
        const isMedia = ["jpg", "jpeg", "png", "gif", "mov", "mp4"].includes(
          fileExtension
        );

        if (isMedia) {
          await MediaLibrary.saveToLibraryAsync(uri);
          Alert.alert("Thành công", "File đã được lưu vào thư viện");
        } else {
          // Sử dụng QuickLook để xem file
          await Sharing.shareAsync(uri, {
            UTI: "public.item",
            mimeType: "application/octet-stream",
          });
        }
      } else {
        // Trên Android, lưu file và mở
        await MediaLibrary.createAssetAsync(uri);

        const contentUri = await FileSystem.getContentUriAsync(uri);
        await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
          data: contentUri,
          flags: 1,
          type: "*/*",
        });

        Alert.alert("Thành công", "File đã được tải về máy của bạn");
      }
    } catch (error) {
      if (error.message !== "Download canceled") {
        // console.error("Lỗi khi tải file:", error);
        Alert.alert("Thông báo", "Đã hủy tải file");
      }
    } finally {
      // Cleanup
      setDownloadingFiles((prev) => {
        const newState = { ...prev };
        delete newState[messageId];
        return newState;
      });
      setDownloadResumables((prev) => {
        const newState = { ...prev };
        delete newState[messageId];
        return newState;
      });
    }
  };

  const handleCancelDownload = async (messageId) => {
    try {
      const downloadResumable = downloadResumables[messageId];
      if (downloadResumable) {
        await downloadResumable.cancelAsync();

        // Cleanup states
        setDownloadingFiles((prev) => {
          const newState = { ...prev };
          delete newState[messageId];
          return newState;
        });
        setDownloadResumables((prev) => {
          const newState = { ...prev };
          delete newState[messageId];
          return newState;
        });
      }
    } catch (error) {
      console.error("Lỗi khi hủy tải file:", error);
    }
  };

  const handleAudioComplete = async (audioFile) => {
    try {
      let roomId;
      if (chat.chatType === "group") {
        roomId = `group_${chat.id}`;
        console.log("Joining group room:", roomId);
      } else {
        const userIds = [user.id, chat.id].sort();
        roomId = `chat_${userIds[0]}_${userIds[1]}`;
        console.log("Joining private chat room:", roomId);
      }

      const audioFormData = new FormData();

      // Tạo file object với đúng format
      const audioFileObj = {
        uri: audioFile.uri,
        type: "audio/m4a",
        name: `audio-${Date.now()}.m4a`,
      };

      // Append file và các thông tin cần thiết
      audioFormData.append("audio", audioFileObj);
      audioFormData.append("sender_id", user.id);
      audioFormData.append("receiver_id", chat.id);
      audioFormData.append("type", "audio");
      audioFormData.append(
        "chat_type",
        chat?.chatType === "group" ? "group" : "private"
      );
      audioFormData.append("duration", audioFile.duration.toString());
      audioFormData.append("content", "");

      setIsUploading(true);

      const response = await axios.post(
        `${API_iChat}/send-message`,
        audioFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        }
      );

      if (response.data.data) {
        const messageToSend = {
          ...response.data.data,
          chatId: roomId,
        };
        socketService.handleSendMessage(messageToSend);
      }
    } catch (error) {
      console.error(
        "Lỗi khi gửi audio:",
        error.response?.data || error.message
      );
      Alert.alert("Lỗi", "Không thể gửi tin nhắn thoại. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header của Chatting */}
      <View style={styles.chatHeader}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image
                source={require("../../assets/icons/go-back.png")}
                style={{ width: 25, height: 25 }}
              />
            </TouchableOpacity>

            <View style={{ marginLeft: 10, gap: 2 }}>
              <Text style={styles.name}>{chat.name}</Text>
              {/* <Text style={{ fontSize: 12, color: "gray" }}>
                {chat.status === "Online" ? "Đang hoạt động" : "Ngoại tuyến"}
              </Text> */}
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 15,
              paddingRight: 10,
            }}
          >
            <TouchableOpacity onPress={handleInitiateCall}>
              <Image
                source={require("../../assets/icons/phone-call.png")}
                style={[styles.iconsInHeader, isInCall && { tintColor: "red" }]}
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image
                source={require("../../assets/icons/video.png")}
                style={{ width: 25, height: 25 }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("Option", {
                  id: chat.id,
                  name: chat.name,
                  avatar: chat.avatar,
                  //
                });
              }}
            >
              <Image
                source={require("../../assets/icons/option.png")}
                style={styles.iconsInHeader}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {typeChat === "blocked" && (
        <View
          style={
            Platform.OS === "ios"
              ? [styles.blockedContainer, { padding: 10 }]
              : [styles.blockedContainer, { padding: 5 }]
          }
        >
          <Text style={styles.blockedText}>
            {blockStatus.blockedByTarget ? (
              `Bạn đã bị ${chat.name} chặn`
            ) : (
              <>
                <TouchableOpacity disabled>
                  <Text style={styles.blockedText}>
                    Bạn đã chặn {chat.name}.{" "}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleUnblockUser(chat.id)}>
                  <Text
                    style={{
                      textDecorationLine: "underline",
                      fontWeight: "600",
                      fontSize: 16,
                    }}
                  >
                    Hủy chặn
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Text>
        </View>
      )}
      {typeChat === "not-friend" && (
        <View
          style={
            Platform.OS === "ios"
              ? [styles.blockedContainer, { padding: 10 }]
              : [styles.blockedContainer, { padding: 5 }]
          }
        >
          <View style={styles.blockedText}>
            <Text style={styles.blockedText}>Kết bạn để nhắn tin. </Text>
            <TouchableOpacity onPress={() => handleSendFriendRequest(chat.id)}>
              <Text
                style={{
                  textDecorationLine: "underline",
                  fontWeight: "600",
                  fontSize: 16,
                }}
              >
                Kết bạn
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Tin nhắn sẽ được hiển thị ở vùng nay */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          // keyExtractor={(item) => item._id}
          keyExtractor={(item, index) => item._id?.toString() || `msg-${index}`}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            // console.log("Tin nhắn:", item);

            const isLastMessage = index === messages.length - 1;
            const isMyMessage = item.sender_id === user.id;
            const isRecalled = item.content === "Tin nhắn đã được thu hồi";
            const repliedMessage = item.reply_to
              ? messages.find((msg) => msg._id === item.reply_to)
              : null;

            // Kiểm tra nếu là ảnh nhóm và không phải ảnh đầu tiên thì bỏ qua
            if (item.type === "image" && item.is_group_images) {
              const groupImages = messages.filter(
                (msg) => msg.group_id === item.group_id && msg.type === "image"
              );
              if (item._id !== groupImages[0]._id) {
                return null; // Không render gì cả
              }
            }

            return (
              <View>
                {item.type !== "notify" ? (
                  <TouchableOpacity
                    onLongPress={() => handleLongPress(item)}
                    delayLongPress={300}
                    style={[
                      styles.message,
                      item.sender_id === user.id
                        ? styles.myMessage
                        : styles.theirMessage,
                      item.reactions?.length > 0 && { marginBottom: 15 }, // Thêm marginBottom nếu có reactions
                    ]}
                  >
                    {/* Tên người gửi */}
                    {!isMyMessage && chat.chatType === "group" && (
                      <Text style={styles.replySender}>
                        {getMemberName(item.sender_id)}
                      </Text>
                    )}
                    {/* Hiển thị tin nhắn Reply => Hiển thị tin nhắn gốc trước */}
                    {repliedMessage && (
                      <View style={styles.replyContainer}>
                        <Text style={styles.replySender}>
                          {repliedMessage.sender_id === user.id
                            ? "Bạn"
                            : chat.chatType === "group"
                            ? getMemberName(repliedMessage.sender_id)
                            : chat.name}
                        </Text>

                        {repliedMessage.type === "text" && (
                          <Text
                            style={styles.replyText}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {repliedMessage.content}
                          </Text>
                        )}

                        {repliedMessage.type === "image" && (
                          <Text style={styles.replyText}>[Hình ảnh]</Text>
                        )}

                        {repliedMessage.type === "file" && (
                          <View style={styles.replyFileContainer}>
                            <Image
                              source={require("../../assets/icons/attachment.png")}
                              style={styles.replyFileIcon}
                            />
                            <Text
                              style={styles.replyFileName}
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {getFileNameFromUrl(repliedMessage.content) ||
                                "Tệp đính kèm"}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                    {item.type === "image" ? (
                      item.is_group_images ? (
                        <GroupImagesMessage
                          message={item}
                          messages={messages}
                          navigation={navigation}
                          isMyMessage={item.sender_id === user.id}
                        />
                      ) : (
                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate("ViewImageChat", {
                              imageUrl: item.content,
                              images: [item.content],
                            })
                          }
                        >
                          <Image
                            source={{ uri: item.content }}
                            style={{
                              width: 200,
                              height: 200,
                              borderRadius: 10,
                              marginTop: 5,
                            }}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      )
                    ) : item.type === "file" ? (
                      <TouchableOpacity
                        style={styles.fileContainer}
                        onPress={() => {
                          if (!downloadingFiles[item._id]) {
                            Alert.alert(
                              "Tải file",
                              "Bạn muốn tải file này về máy?",
                              [
                                { text: "Hủy", style: "cancel" },
                                {
                                  text: "Tải về",
                                  onPress: () =>
                                    handleFileDownload(item.content, item._id),
                                },
                              ]
                            );
                          }
                        }}
                      >
                        <Image
                          source={require("../../assets/icons/attachment.png")}
                          style={styles.fileIcon}
                        />
                        <View style={styles.fileInfoContainer}>
                          <Text
                            style={styles.fileName}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {getFileNameFromUrl(item.content) || "Tệp đính kèm"}
                          </Text>
                          {downloadingFiles[item._id] !== undefined && (
                            <View style={styles.downloadContainer}>
                              <View style={styles.downloadProgressContainer}>
                                <View
                                  style={[
                                    styles.downloadProgressBar,
                                    {
                                      width: `${
                                        downloadingFiles[item._id] * 100
                                      }%`,
                                    },
                                  ]}
                                />
                                <Text style={styles.downloadProgressText}>
                                  {Math.round(downloadingFiles[item._id] * 100)}
                                  %
                                </Text>
                              </View>
                              <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => handleCancelDownload(item._id)}
                              >
                                <Image
                                  source={require("../../assets/icons/close.png")}
                                  style={styles.cancelIcon}
                                />
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    ) : item.type === "video" ? (
                      <View style={styles.videoMessageContainer}>
                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate("ViewVideoChat", {
                              videoUrl: item.content,
                            })
                          }
                        >
                          <Video
                            source={{ uri: item.content }}
                            style={styles.videoPlayer}
                            useNativeControls
                            resizeMode="contain"
                            isLooping={false}
                            shouldPlay={false}
                            isMuted={false}
                            usePoster={true}
                            posterSource={{ uri: item.content }}
                          />
                        </TouchableOpacity>
                      </View>
                    ) : item.type === "audio" ? (
                      <TouchableOpacity
                        style={[
                          styles.audioContainer,
                          isMyMessage
                            ? styles.myAudioMessage
                            : styles.theirAudioMessage,
                        ]}
                        onPress={() => handlePlayAudio(item.content, item._id)}
                      >
                        <View style={styles.audioContent}>
                          <Ionicons
                            name={
                              audioStatus[item._id]?.isPlaying
                                ? "pause"
                                : "play"
                            }
                            size={24}
                            color={isMyMessage ? "#fff" : "#000"}
                          />
                          <View style={styles.audioInfo}>
                            {/* {console.log(audioStatus[item._id]?.status)} */}
                            <View style={styles.audioProgressBar}>
                              <View
                                style={[
                                  styles.audioProgress,
                                  {
                                    width: `${
                                      ((audioStatus[item._id]?.status
                                        ?.positionMillis || 0) /
                                        (audioStatus[item._id]?.status
                                          ?.durationMillis || 1)) *
                                      100
                                    }%`,
                                    backgroundColor: isMyMessage
                                      ? "#fff"
                                      : "#000",
                                  },
                                ]}
                              />
                            </View>
                            <Text
                              style={[
                                styles.audioDuration,
                                { color: isMyMessage ? "#fff" : "#000" },
                              ]}
                            >
                              {formatDuration(
                                Math.floor(
                                  audioStatus[item._id]?.status.durationMillis /
                                    1000
                                ) || 0
                              )}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <Text
                        style={[
                          styles.messageText,
                          isRecalled && styles.recalledText,
                        ]}
                      >
                        {item.content}
                      </Text>
                    )}
                    {/* Hiển thị thời gian hh:mm gửi tin nhắn */}
                    {isLastMessage && (
                      <Text style={styles.timestamp}>
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    )}
                    {/* Hiển thị reactions */}
                    {Array.isArray(item.reactions) &&
                      item.reactions.length > 0 && (
                        <View
                          style={[
                            styles.reactionsContainer,
                            isMyMessage
                              ? styles.reactionsRight
                              : styles.reactionsLeft,
                          ]}
                        >
                          <TouchableOpacity
                            style={styles.reactionsWrapper}
                            onPress={() => Alert.alert("Đã thả react")}
                          >
                            {renderReactionIcons(item.reactions)}
                          </TouchableOpacity>
                        </View>
                      )}
                  </TouchableOpacity>
                ) : (
                  <View
                    style={[
                      styles.notification,
                      isMyMessage
                        ? styles.myNotification
                        : styles.theirNotification,
                    ]}
                  >
                    <Text style={styles.notificationText}>{item.content}</Text>
                  </View>
                )}

                {/* Hiển thị trạng thái của tin nhắn: Đã gửi, Đã nhận, Đã xem */}
                {isLastMessage &&
                  item.sender_id === user.id &&
                  item.type !== "notify" && (
                    <View style={styles.statusWrapper}>
                      <Text style={styles.statusText}>
                        {item.status === "sent"
                          ? "Đã gửi"
                          : item.status === "received"
                          ? "Đã nhận"
                          : "Đã xem"}
                      </Text>
                    </View>
                  )}
              </View>
            );
          }}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />
        {/* Modal Thao Tác Tin Nhắn */}
        <Modal visible={modalVisible} transparent animationType="none">
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                {selectedMessage?.content === "Tin nhắn đã được thu hồi" ? (
                  // Chỉ hiển thị chức năng Xóa
                  <View
                    style={{
                      backgroundColor: "white",
                      borderRadius: 10,
                      paddingTop: 10,
                    }}
                  >
                    <View style={{}}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleSoftDelete}
                      >
                        <Image
                          source={require("../../assets/icons/delete-message.png")}
                          style={styles.icon}
                        />
                        <Text style={styles.modalOption}>Xóa</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  // Hiển thị tất cả chức năng như hiện tại
                  <>
                    {/* Thả reaction */}
                    <View
                      style={[
                        styles.row,
                        {
                          backgroundColor: "white",
                          width: "100%",
                          borderRadius: 10,
                          padding: 10,
                        },
                      ]}
                    >
                      <TouchableOpacity onPress={() => handleReaction("like")}>
                        <Image
                          source={require("../../assets/icons/emoji-like.png")}
                          style={styles.iconEmoji}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleReaction("haha")}>
                        <Image
                          source={require("../../assets/icons/emoji-haha.png")}
                          style={styles.iconEmoji}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleReaction("love")}>
                        <Image
                          source={require("../../assets/icons/emoji-love.png")}
                          style={styles.iconEmoji}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleReaction("sad")}>
                        <Image
                          source={require("../../assets/icons/emoji-cry.png")}
                          style={styles.iconEmoji}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleReaction("wow")}>
                        <Image
                          source={require("../../assets/icons/emoji-surprised.png")}
                          style={styles.iconEmoji}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleReaction("angry")}>
                        <Image
                          source={require("../../assets/icons/emoji-angry.png")}
                          style={styles.iconEmoji}
                        />
                      </TouchableOpacity>
                    </View>

                    <View
                      style={{
                        backgroundColor: "white",
                        width: "100%",
                        borderRadius: 10,
                        padding: 10,
                      }}
                    >
                      <View style={styles.row}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleReply(selectedMessage)}
                        >
                          <Image
                            source={require("../../assets/icons/reply-message.png")}
                            style={styles.icon}
                          />
                          <Text style={styles.modalOption}>Trả lời</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={handleForwardMessage}
                        >
                          <Image
                            source={require("../../assets/icons/forward-message.png")}
                            style={styles.icon}
                          />
                          <Text style={styles.modalOption}>Chuyển tiếp</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => console.log("Ghim tin nhắn")}
                        >
                          <Image
                            source={require("../../assets/icons/pin.png")}
                            style={styles.icon}
                          />
                          <Text style={styles.modalOption}>Ghim</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleRecallMessage(selectedMessage)}
                        >
                          <Image
                            source={require("../../assets/icons/recall.png")}
                            style={styles.icon}
                          />
                          <Text style={styles.modalOption}>Thu hồi</Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.row}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => console.log("Xem chi tiết tin nhắn")}
                        >
                          <Image
                            source={require("../../assets/icons/details.png")}
                            style={styles.icon}
                          />
                          <Text style={styles.modalOption}>Xem chi tiết</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => console.log("Lưu vào Cloud")}
                        >
                          <Image
                            source={require("../../assets/icons/save-cloud.png")}
                            style={styles.icon}
                          />
                          <Text style={styles.modalOption}>Lưu vào Cloud</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={handleCopyMessage}
                        >
                          <Image
                            source={require("../../assets/icons/copy.png")}
                            style={styles.icon}
                          />
                          <Text style={styles.modalOption}>Sao chép</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={handleSoftDelete}
                        >
                          <Image
                            source={require("../../assets/icons/delete-message.png")}
                            style={styles.icon}
                          />
                          <Text style={styles.modalOption}>Xóa</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                )}
              </View>
            </View>
          </Pressable>
        </Modal>

        {/* Hiển thị tin nhắn gốc khi ĐANG TRẢ LỜI */}
        {replyMessage && (
          <View style={styles.replyPreview}>
            <View style={{ flex: 1 }}>
              <Text style={styles.replyPreviewText}>
                Đang trả lời tin nhắn của{" "}
                {replyMessage.sender_id === user.id
                  ? "Bạn"
                  : getMemberName(replyMessage.sender_id)}
                :
              </Text>
              {replyMessage.type === "text" && (
                <Text
                  style={styles.replyPreviewText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {replyMessage.content}
                </Text>
              )}
              {replyMessage.type === "image" && (
                <Image
                  source={{ uri: replyMessage.content }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 6,
                    marginTop: 4,
                  }}
                />
              )}
              {replyMessage.type === "file" && (
                <View style={styles.replyFileContainer}>
                  <Image
                    source={require("../../assets/icons/attachment.png")}
                    style={styles.replyFileIcon}
                  />
                  <Text
                    style={styles.replyFileName}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {replyMessage.fileName || "Tệp đính kèm"}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={() => setReplyMessage(null)}>
              <Text style={styles.cancelReply}>Hủy</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Thanh soạn/gửi tin nhắn */}
        <MessageInputBar
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          selectedImages={selectedImages}
          setSelectedImages={setSelectedImages}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          selectedVideo={selectedVideo}
          setSelectedVideo={setSelectedVideo}
          sendMessage={sendMessage}
          pickImage={pickImage}
          pickVideo={pickVideo}
          pickFile={pickFile}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          onRecordComplete={handleAudioComplete}
        />

        <CallOverlay
          isVisible={["connecting", "ongoing", "outgoing"].includes(callStatus)}
          callStatus={callStatus}
          duration={formatDuration(callDuration)}
          isMuted={isMuted}
          onEndCall={endAudioCall}
          onToggleMute={handleToggleMute}
          callerName={chat.name}
        />

        <IncomingCallScreen
          isVisible={callStatus === "incoming"}
          callerName={incomingCall?.callerName || chat.name}
          callerAvatar={incomingCall?.callerAvatar || chat.avatar.uri}
          callerId={incomingCall?.callerId}
          roomId={incomingCall?.roomId}
          onAccept={handleAcceptCall}
          onDecline={handleRejectCall}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 10,
    height: 90,
    justifyContent: "space-between",
    backgroundColor: "white",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },
  messagesContainer: {
    flexGrow: 1,
    justifyContent: "flex-end",
    padding: 10,
    backgroundColor: "#E4E8F3",
  },
  message: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: "80%",
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#D2EFFD",
    borderWidth: 1,
    borderColor: "#C5DDE5",
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
  },
  replyContainer: {
    backgroundColor: "#f0f0f0",
    borderLeftWidth: 2,
    borderLeftColor: "#007AFF",
    marginBottom: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 5,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    maxWidth: "80%",
  },
  replySender: {
    fontSize: 16,
    paddingBottom: 3,
    color: "#F75E40",
  },
  replyText: {
    fontSize: 14,
    color: "#555",
    fontStyle: "italic",
  },
  replyFileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  replyFileIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  replyFileName: {
    fontSize: 13,
    color: "#444",
    flex: 1,
  },
  messageText: {
    fontSize: 16,
    paddingVertical: 3,
  },
  replyPreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
    paddingHorizontal: 10,
    minHeight: 70,
    maxHeight: 120,
  },
  replyPreviewText: {
    flex: 1,
    fontStyle: "italic",
    color: "#555",
  },
  cancelReply: {
    color: "red",
    marginLeft: 10,
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#CCC",
    padding: 10,
    backgroundColor: "white",
    gap: 5,
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 25,
    marginRight: 10,
    marginLeft: 10,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    borderRadius: 25,
    padding: 10,
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  iconsInHeader: {
    width: 18,
    height: 18,
  },
  timestamp: {
    fontSize: 12,
    color: "gray",
    alignSelf: "flex-start",
    marginTop: 2,
    opacity: 0.8,
    paddingTop: 5,
  },
  status: {
    fontSize: 12,
    color: "blue",
    alignSelf: "flex-end",
    marginTop: 2,
    opacity: 0.8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  closeModal: { fontSize: 18, color: "red", marginTop: 10, fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    borderRadius: 10,
    padding: 20,
  },
  modalContent: {
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 15,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 70,
    height: 70,
  },
  icon: {
    width: 25,
    height: 25,
  },
  modalOption: {
    fontSize: 12,
    marginTop: 10,
    textAlign: "center",
    opacity: 0.8,
  },
  iconEmoji: {
    width: 40,
    height: 40,
  },
  recalledMessage: {
    backgroundColor: "#f0f0f0",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  recalledText: {
    fontStyle: "italic",
    color: "#888",
  },
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
  fileIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  fileName: {
    color: "#333",
    fontSize: 14,
    flexShrink: 1,
  },
  downloadProgressContainer: {
    height: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    marginTop: 5,
    overflow: "hidden",
  },
  downloadProgressBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
  },
  downloadProgressText: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    color: "#000",
    fontSize: 12,
    lineHeight: 20,
  },
  reactionsContainer: {
    position: "absolute",
    bottom: -16,
    marginBottom: 5,
    zIndex: 10,
    elevation: 5,
  },
  reactionsLeft: {
    left: 5,
    alignSelf: "flex-start",
  },
  reactionsRight: {
    right: 5,
    alignSelf: "flex-end",
  },
  reactionsWrapper: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 16,
    padding: 2,
    elevation: 2,
  },
  reactionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 2,
  },
  reactionIcon: {
    fontSize: 10,
  },
  statusWrapper: {
    alignSelf: "flex-end",
    backgroundColor: "#eee",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 13,
    color: "#555",
  },
  blockedContainer: {
    backgroundColor: "#f9d7d7",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#e5e5e5",
  },
  blockedText: {
    color: "#d32f2f",
    fontSize: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  notFriendContainer: {
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#e5e5e5",
  },
  notFriendText: {
    color: "#757575",
    fontSize: 14,
  },
  groupImagesWrapper: {
    borderRadius: 10,
    overflow: "hidden",
    maxWidth: 280,
    marginVertical: 2,
  },
  myGroupImages: {
    alignSelf: "flex-end",
  },
  theirGroupImages: {
    alignSelf: "flex-start",
  },
  singleGroupImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  twoImagesContainer: {
    flexDirection: "row",
    width: 200,
    height: 200,
    gap: 2,
  },
  twoImagesItem: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  twoImagesImage: {
    width: "100%",
    height: "100%",
  },
  multipleImagesContainer: {
    flexDirection: "row",
    width: 200,
    height: 200,
    gap: 2,
  },
  mainImageContainer: {
    flex: 2,
  },
  mainImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  smallImagesContainer: {
    flex: 1,
    gap: 2,
  },
  smallImageItem: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  smallImage: {
    width: "100%",
    height: "100%",
  },
  remainingCountOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  remainingCountText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  videoPlayer: {
    width: 250,
    height: 150,
    borderRadius: 10,
    marginTop: 5,
  },
  videoMessageContainer: {
    maxWidth: "70%",
    borderRadius: 10,
    overflow: "hidden",
    marginVertical: 2,
  },
  fileInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  downloadProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  downloadProgressBar: {
    height: 4,
    backgroundColor: "#007AFF",
    borderRadius: 2,
  },
  downloadProgressText: {
    fontSize: 10,
    color: "#fff",
  },
  downloadContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  downloadProgressContainer: {
    height: 15,
    backgroundColor: "#0AA2F8",
    borderRadius: 10,
    overflow: "hidden",
    width: "80%",
  },
  downloadProgressBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
  },
  downloadProgressText: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    color: "#fff",
    fontSize: 12,
    lineHeight: 20,
  },
  cancelButton: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelIcon: {
    width: 16,
    height: 16,
    tintColor: "red",
  },
  audioContainer: {
    padding: 10,
    borderRadius: 20,
    maxWidth: "70%",
  },
  myAudioMessage: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-end",
  },
  theirAudioMessage: {
    backgroundColor: "#E8E8E8",
    alignSelf: "flex-start",
  },
  audioContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 150,
  },
  audioInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  audioProgressBar: {
    height: 4,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 2,
    flex: 1,
  },
  audioProgress: {
    borderRadius: 2,
  },
  audioDuration: {
    fontSize: 14,
    minWidth: 60,
    marginLeft: 10,
  },
  notification: {
    alignSelf: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 5,
    maxWidth: "80%", // Giới hạn chiều rộng
  },
  myNotification: {
    borderColor: "#007AFF", // Viền xanh lam
  },
  theirNotification: {
    borderColor: "#646464", // Viền xám
  },
  notificationText: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
  },
});

export default Chatting;
