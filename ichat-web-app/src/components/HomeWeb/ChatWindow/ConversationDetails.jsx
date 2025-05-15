import React from "react";
import { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Button,
  message,
  Modal,
  Alert,
  Spin,
  Badge,
  List,
  Empty,
  Tabs,
} from "antd"; // Thêm message, Modal
import "./ConversationDetails.css";
import socket from "../../services/socket";
import { FaCaretDown } from "react-icons/fa";
import { FaCaretRight } from "react-icons/fa";
import { BiSolidFilePdf } from "react-icons/bi";
import { AiFillFileZip } from "react-icons/ai";
import {
  FaFileWord,
  FaFilePowerpoint,
  FaFileExcel,
  FaFileAlt,
} from "react-icons/fa";
import { CiLink } from "react-icons/ci";
import { MdOutlineGroup } from "react-icons/md";
import { Divider, Input, Select, Checkbox } from "antd";
import {
  EditOutlined,
  BellOutlined,
  PushpinOutlined,
  UsergroupAddOutlined,
  UserOutlined,
  LogoutOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  DownloadOutlined,
  PlayCircleOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import {
  UserAddOutlined,
  SettingOutlined,
  UploadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { CameraOutlined } from "@ant-design/icons";
import { createGroup } from "../../../redux/slices/groupSlice";
import { getUserFriends } from "../../../redux/slices/friendSlice";
import {
  searchGroup,
  isGroupSubAdmin,
  updateGroup,
  deleteGroup,
  setRole,
  removeMember,
  addMembers,
  getGroupById,
  transferAdmin,
} from "../../../redux/slices/groupSlice";
import {
  fetchChatMessages,
  fetchMessages,
  getUserMessages,
} from "../../../redux/slices/messagesSlice";
import { GrContract } from "react-icons/gr";
import GifPicker from "./GifPicker";
import Picker from "emoji-picker-react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { MessageOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { sendFriendRequest } from "../../../redux/slices/friendSlice";
import GroupInviteModal from "./GroupInviteModal";
import { ShareAltOutlined } from "@ant-design/icons";
import {
  updateMemberApproval,
  getPendingMembers,
  getInvitedMembersByUserId,
  acceptMember,
  rejectMember,
  checkMemberApproval,
} from "../../../redux/slices/groupSlice";
const ConversationDetails = ({
  isVisible,
  selectedChat,
  handleExpandContract,
  isExpanded,
  activeTabFromMessageArea,
  handleSendMessage,
  onImageUpload,
  setInputMessage,
  allMessages,
  user,
  onLeaveGroup,
  onSelectUser,
  onUpdateSelectedChat,
}) => {
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("info");
  const [nickname, setNickname] = useState(selectedChat?.name || "");
  const [showModalSetNickName, setShowModalSetNickName] = useState(false);
  const [isOpenMedia, setIsOpenMedia] = useState(true);
  const [isOpenFile, setIsOpenFile] = useState(false);
  const [isOpenLink, setIsOpenLink] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [selectedGif, setSelectedGif] = useState(null);
  const [activeTabForEmojiGif, setActiveTabForEmojiGif] = useState("emoji");
  const [groupMembers, setGroupMembers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLeaveGroupModal, setShowLeaveGroupModal] = useState(false);
  const [showDeleteHistoryModal, setShowDeleteHistoryModal] = useState(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [showGroupSettingsModal, setShowGroupSettingsModal] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupName, setGroupName] = useState(selectedChat?.name || "");
  const [groupAvatar, setGroupAvatar] = useState(null);
  const [requireApproval, setRequireApproval] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpenMembers, setIsOpenMembers] = useState(true);
  const [showAllMembers, setShowAllMembers] = useState(false);
  // Thêm state cho fileItems đã xử lý
  const [processedFileItems, setFileItems] = useState([]);
  // Thêm state
  const [showAllFiles, setShowAllFiles] = useState(false);
  // Thêm các state mới này vào đầu component
  const [showImageViewerModal, setShowImageViewerModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupAvatar, setNewGroupAvatar] = useState(null);
  const [newGroupAvatarPreview, setNewGroupAvatarPreview] = useState(null);
  const [selectedFriendsForGroup, setSelectedFriendsForGroup] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [searchFriendTerm, setSearchFriendTerm] = useState("");
  // State kiểm tra admin và cho phép quyền
  const [isSubAdmin, setIsSubAdmin] = useState(false);
  const [isMainAdmin, setIsMainAdmin] = useState(false);
  const [groupSettings, setGroupSettings] = useState({
    // allow_add_members: true,
    allow_change_name: true,
    allow_change_avatar: true,
  });
  // State cho modal chọn admin mới khi rời nhóm
  const [showTransferAdminModal, setShowTransferAdminModal] = useState(false);
  const [newAdminId, setNewAdminId] = useState(null);
  //State hiển thị trang cá nhân
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberInfoModal, setShowMemberInfoModal] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [isCheckingFriend, setIsCheckingFriend] = useState(false);
  // state mở grouInvite
  const [showInviteModal, setShowInviteModal] = useState(false);
  const navigate = useNavigate();
  // State để quản lý modal chuyển quyền admin
  const [showTransferAdminChooserModal, setShowTransferAdminChooserModal] =
    useState(false);
  const [newAdminIdForTransfer, setNewAdminIdForTransfer] = useState(null);
  // State cho quản lý thành viên (Phê duyệt)
  const [pendingMembers, setPendingMembers] = useState([]);
  const [invitedMembers, setInvitedMembers] = useState([]);
  const [memberApprovalLoading, setMemberApprovalLoading] = useState(false);
  const [pendingMembersLoading, setPendingMembersLoading] = useState(false);
  const [showPendingMembersModal, setShowPendingMembersModal] = useState(false);
  const [membersTabActive, setMembersTabActive] = useState("pending"); // 'pending' | 'aprroved'
  const [groupAvatarPreview, setGroupAvatarPreview] = useState(null);
  //  hàm lấy trạng thái phê duyệt
  const fetchMemberApprovalStatus = async () => {
    try {
      const response = await dispatch(
        checkMemberApproval(selectedChat.id)
      ).unwrap();
      // setRequireApproval(response);
      if (response && typeof response === "object" && "data" in response) {
        setRequireApproval(response.data);
      } else {
        // If response is directly the boolean value
        setRequireApproval(response);
      }
      // console.log("Member approval status:", response);
    } catch (error) {
      console.error("Error fetching member approval status:", error);
    }
  };

  //  hàm lấy danh sách thành viên chờ duyệt
  const fetchPendingMembers = async () => {
    setPendingMembersLoading(true);
    try {
      const response = await dispatch(
        getPendingMembers(selectedChat.id)
      ).unwrap();
      setPendingMembers(response || []);
    } catch (error) {
      console.error("Error fetching pending members:", error);
      // message.error("Không thể tải danh sách thành viên chờ duyệt");
    } finally {
      setPendingMembersLoading(false);
    }
  };

  //  hàm lấy danh sách thành viên đã được mời
  const fetchInvitedMembers = async () => {
    try {
      const response = await dispatch(
        getInvitedMembersByUserId({groupId:selectedChat.id,userId:user.id})
      ).unwrap();
      setInvitedMembers(response || []);
    } catch (error) {
      console.error("Error fetching invited members:", error);
    }
  };
  // hàm xử lý cập nhật trạng thái phê duyệt
  const handleUpdateApprovalSetting = async (checked) => {
    setMemberApprovalLoading(true);
    try {
      await dispatch(
        updateMemberApproval({
          groupId: selectedChat.id,
          requireApproval: checked,
        })
      ).unwrap();
      socket.emit("update-member-approval", {
        groupId: selectedChat.id,
        requireApproval: checked,
      });
      setRequireApproval(checked);
      message.success("Đã cập nhật cài đặt phê duyệt thành viên");
    } catch (error) {
      console.error("Error updating member approval setting:", error);
      message.error("Không thể cập nhật cài đặt phê duyệt thành viên");
      // Khôi phục lại giá trị cũ nếu có lỗi
      setRequireApproval(!checked);
    } finally {
      setMemberApprovalLoading(false);
    }
  };
  // Thêm hàm xử lý chấp nhận thành viên
  const handleAcceptMember = async (memberId, memberName) => {
    try {
      message.loading({
        content: "Đang chấp nhận thành viên...",
        key: "acceptMember",
      });

      await dispatch(
        acceptMember({
          groupId: selectedChat.id,
          memberId: memberId,
          adminId: user.id,
        })
      ).unwrap();
      socket.emit("accept-member", {
        groupId: selectedChat.id,
        memberId: memberId,
      });
      message.success({
        content: `Đã chấp nhận ${memberName} vào nhóm`,
        key: "acceptMember",
      });
      await dispatch(getUserMessages(selectedChat.id));
      // Cập nhật lại danh sách thành viên chờ duyệt
      fetchPendingMembers();
      // Cập nhật lại danh sách thành viên nhóm
      fetchGroupMembers();
    } catch (error) {
      message.error({
        content: error.message || "Không thể chấp nhận thành viên",
        key: "acceptMember",
      });
      console.error("Error accepting member:", error);
    }
  };

  // Thêm hàm xử lý từ chối thành viên
  const handleRejectMember = async (memberId, memberName) => {
    try {
      message.loading({
        content: "Đang từ chối yêu cầu...",
        key: "rejectMember",
      });

      await dispatch(
        rejectMember({
          groupId: selectedChat.id,
          memberId: memberId,
          adminId: user.id,
        })
      ).unwrap();
      socket.emit("reject-member", {
        groupId: selectedChat.id,
        memberId: memberId,
      });
      message.success({
        content: `Đã từ chối yêu cầu của ${memberName}`,
        key: "rejectMember",
      });

      // Cập nhật lại danh sách thành viên chờ duyệt
      fetchPendingMembers();
    } catch (error) {
      message.error({
        content: error.message || "Không thể từ chối yêu cầu",
        key: "rejectMember",
      });
      console.error("Error rejecting member:", error);
    }
  };
  // Thêm useEffect để kiểm tra định kỳ yêu cầu tham gia mới
  useEffect(() => {
    let interval;

    if (
      selectedChat?.chat_type === "group" &&
      selectedChat?.id &&
      (isMainAdmin || isSubAdmin)
    ) {
      // Gọi API lần đầu
      fetchPendingMembers();

      // Thiết lập interval để kiểm tra định kỳ (mỗi 30 giây)
      interval = setInterval(() => {
        fetchPendingMembers();
      }, 30000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [selectedChat, isMainAdmin, isSubAdmin]);
  // Hàm xử lý chuyển quyền admin chính
  const handleTransferAdmin = async () => {
    if (!newAdminIdForTransfer) {
      return message.error(
        "Vui lòng chọn một thành viên để chuyển quyền admin"
      );
    }

    try {
      message.loading({
        content: "Đang chuyển quyền admin...",
        key: "transferAdmin",
      });

      // Chuyển quyền admin cho thành viên mới
      await dispatch(
        transferAdmin({
          groupId: selectedChat.id,
          userId: newAdminIdForTransfer,
          currentAdminId: user.id,
        })
      ).unwrap();
      socket.emit("transfer-admin", {
        groupId: selectedChat.id,
        userId: newAdminIdForTransfer,
      });

      // Cập nhật quyền của mình thành thành viên thường
      await dispatch(
        setRole({
          groupId: selectedChat.id,
          userId: user.id,
          role: "member",
          adminId:user.id,
        })
      ).unwrap();
      socket.emit("set-role", {
        groupId: selectedChat.id,
        userId: user.id,
        role: "member",
      });

      // Thêm thông báo loading khi cập nhật dữ liệu
      message.loading({ content: "Đang cập nhật dữ liệu...", key: "updating" });

      // Cập nhật trực tiếp giá trị admin_id trong selectedChat
      const updatedSelectedChat = {
        ...selectedChat,
        admin_id: newAdminIdForTransfer,
      };

      // Nếu có hàm callback từ component cha để cập nhật selectedChat
      if (typeof onUpdateSelectedChat === "function") {
        onUpdateSelectedChat(updatedSelectedChat);
      }

      // Cập nhật danh sách thành viên và settings
      await Promise.all([fetchGroupMembers(), fetchGroupSettings()]);

      message.success({
        content: "Đã chuyển quyền admin thành công",
        key: "transferAdmin",
      });

      message.success({
        content: "Đã cập nhật thông tin nhóm thành công",
        key: "updating",
      });

      // Đóng modal và cập nhật lại danh sách thành viên
      setShowTransferAdminChooserModal(false);
      setNewAdminIdForTransfer(null);

      // Cập nhật trạng thái người dùng hiện tại
      setIsMainAdmin(false);

      // Thêm kích hoạt sự kiện để thông báo cho các component khác biết về sự thay đổi admin
      window.dispatchEvent(
        new CustomEvent("admin-changed", {
          detail: {
            groupId: selectedChat.id,
            newAdminId: newAdminIdForTransfer,
            previousAdminId: user.id,
          },
        })
      );
    } catch (error) {
      message.error({
        content: error.message || "Không thể chuyển quyền admin",
        key: "transferAdmin",
      });
      console.error("Error transferring admin:", error);
    }
  };
  // Hàm kiểm tra xem hai người đã là bạn bè chưa
  const checkFriendshipStatus = async (memberId) => {
    if (memberId === user.id) return false; // Không thể kết bạn với chính mình

    setIsCheckingFriend(true);
    try {
      // Lấy danh sách bạn bè của user hiện tại
      const response = await axios.get(
        `http://${window.location.hostname}:5001/api/friendships/${user.id}`
      );

      // Kiểm tra xem memberId có trong danh sách bạn bè không
      if (response.data && response.data.friends) {
        const isFriend = response.data.friends.some(
          (friend) =>
            // Kiểm tra cả id và _id vì có thể có sự khác nhau trong cấu trúc dữ liệu
            friend.id === memberId || friend._id === memberId
        );
        setIsCheckingFriend(false);
        return isFriend;
      }

      setIsCheckingFriend(false);
      return false;
    } catch (error) {
      console.error("Lỗi khi kiểm tra trạng thái bạn bè:", error);
      setIsCheckingFriend(false);
      return false;
    }
  };
  // Xử lý khi nhấp vào avatar của thành viên
  const handleMemberClick = async (member) => {
    setSelectedMember(member);
    const friendStatus = await checkFriendshipStatus(member.user_id);
    setIsFriend(friendStatus);
    setShowMemberInfoModal(true);
  };
  // Hàm gửi lời mời kết bạn
  const handleSendFriendRequest = async () => {
    if (!selectedMember) return;

    try {
      message.loading({
        content: "Đang gửi lời mời kết bạn...",
        key: "friendRequest",
      });

      await dispatch(
        sendFriendRequest({
          sender_id: user.id,
          receiver_id: selectedMember.user_id,
        })
      ).unwrap();

      message.success({
        content: "Đã gửi lời mời kết bạn thành công",
        key: "friendRequest",
      });

      setShowMemberInfoModal(false);
    } catch (error) {
      message.error({
        content: error.message || "Không thể gửi lời mời kết bạn",
        key: "friendRequest",
      });
      console.error("Error sending friend request:", error);
    }
  };
  // Hàm chuyển đến chat với thành viên
  const handleMessageMember = () => {
    if (!selectedMember) return;

    // Tạo đối tượng chat với format phù hợp
    const chatUser = {
      id: selectedMember.user_id, // ID của thành viên được chọn, không phải user hiện tại
      name: selectedMember.full_name,
      avatar_path: selectedMember.avatar_path,
      chat_type: "private",
      receiver_id: selectedMember.user_id,
      sender_id: user.id, // Thêm sender_id để rõ ràng
      unread: 0,
      timestamp: new Date().toISOString(),
    };
    // console.log("Chat user:", chatUser);
    onSelectUser(chatUser); // Gọi hàm selectedChat với đối tượng chatUser
    // Đóng modal thông tin
    setShowMemberInfoModal(false);
  };
  // Hàm helper để kiểm tra quyền
  const canAddMembers = () => {
    console.log("Kiểm tra quyền thêm thành viên:", { isMainAdmin, isSubAdmin, isAdmin });
    return isMainAdmin || isSubAdmin ;
  };

  const canChangeName = () => {
    return isMainAdmin || isSubAdmin || groupSettings.allow_change_name;
  };

  const canChangeAvatar = () => {
    return isMainAdmin || isSubAdmin || groupSettings.allow_change_avatar;
  };

  const canDisbandGroup = () => {
    return isMainAdmin; // Chỉ admin chính mới được giải tán nhóm
  };
  useEffect(() => {
    if (selectedChat?.chat_type === "group" && selectedChat?.id && user?.id) {
      dispatch(
        isGroupSubAdmin({
          groupId: selectedChat.id,
          userId: user.id,
        })
      )
        .unwrap()
        .then((result) => {
          // console.log("Check admin result:", result);
          const { isAdmin: isUserAdmin, isMainAdmin: isUserMainAdmin } = result;
          setIsAdmin(isUserAdmin);
          setIsMainAdmin(isUserMainAdmin);
          setIsSubAdmin(isUserAdmin && !isUserMainAdmin);

          // Gọi API members sau khi đã có kết quả từ API kiểm tra quyền
          fetchGroupMembers();
        })
        .catch((error) => {
          console.error("Error checking admin status:", error);
        });
    }
  }, [selectedChat, user, dispatch]);
  useEffect(() => {
    // Xử lý tự động xác định isSubAdmin khi isAdmin hoặc isMainAdmin thay đổi
    if (isAdmin === true && isMainAdmin === false) {
      setIsSubAdmin(true);
      // console.log("Tự động cập nhật: isSubAdmin = true");
    }
  }, [isAdmin, isMainAdmin]);
  // console.log("Debug phân quyền:", {
  //   isMainAdmin,
  //   isSubAdmin,
  //   isAdmin,
  //   userId: user.id,
  //   adminId: selectedChat.admin_id,
  // });
  // Hàm tạo nhóm trò chuyện với chat 1-1

  const handleCreateGroupClick = async () => {
    setShowCreateGroupModal(true);
    setIsLoadingFriends(true);

    try {
      // Lấy danh sách bạn bè
      const friendsResult = await dispatch(getUserFriends(user.id)).unwrap();
      setFriendsList(friendsResult.friends || []);

      // Tự động chọn receiver trong chat hiện tại (nếu có)
      if (selectedChat && selectedChat.id && selectedChat.id !== user.id) {
        setSelectedFriendsForGroup([selectedChat.id]);
      }
    } catch (error) {
      message.error("Không thể tải danh sách bạn bè");
      console.error("Error fetching friends:", error);
    } finally {
      setIsLoadingFriends(false);
    }
  };

  // Handler xử lý avatar
  const handleGroupAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewGroupAvatar(file);
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setNewGroupAvatarPreview(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  // Handler chọn bạn bè cho nhóm
  const handleSelectFriendForGroup = (friendId) => {
    if (selectedFriendsForGroup.includes(friendId)) {
      setSelectedFriendsForGroup(
        selectedFriendsForGroup.filter((id) => id !== friendId)
      );
    } else {
      setSelectedFriendsForGroup([...selectedFriendsForGroup, friendId]);
    }
  };

  // Handler tạo nhóm
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      return message.error("Vui lòng nhập tên nhóm");
    }

    if (selectedFriendsForGroup.length < 2) {
      return message.error("Vui lòng chọn ít nhất 1 người bạn khác");
    }

    try {
      message.loading({ content: "Đang tạo nhóm...", key: "createGroup" });

      // Tạo nhóm mới với danh sách thành viên bao gồm user hiện tại và các bạn bè đã chọn
      const newGroup = await dispatch(
        createGroup({
          name: newGroupName,
          admin_id: user.id, // Người tạo nhóm là admin
          avatar: newGroupAvatar, // File avatar đã chọn (có thể null)
          participant_ids: selectedFriendsForGroup, // Danh sách ID những người đã chọn
        })
      ).unwrap();

      message.success({
        content: "Tạo nhóm thành công!",
        key: "createGroup",
      });
      await dispatch(fetchMessages(user.id || user._id)).unwrap();
      // Đóng modal
      setShowCreateGroupModal(false);

      // Reset các state
      setNewGroupName("");
      setNewGroupAvatar(null);
      setNewGroupAvatarPreview(null);
      setSelectedFriendsForGroup([]);

      // Chuyển hướng đến nhóm mới tạo (nếu cần)
      // TODO: Redirect to new group chat
    } catch (error) {
      message.error({
        content: error.message || "Không thể tạo nhóm. Vui lòng thử lại.",
        key: "createGroup",
      });
      console.error("Error creating group:", error);
    }
  };

  // Hàm thay đổi vai trò
  const handleChangeRole = async (userId, newRole) => {
    try {
      message.loading({
        content: "Đang cập nhật vai trò...",
        key: "changeRole",
      });

      await dispatch(
        setRole({
          groupId: selectedChat.id,
          userId: userId,
          role: newRole,
          adminId: user.id,
        })
      ).unwrap();

      message.success({
        content: "Đã cập nhật vai trò thành viên",
        key: "changeRole",
      });

      // Cập nhật danh sách thành viên
      fetchGroupMembers();
    } catch (error) {
      message.error({
        content: error.message || "Không thể cập nhật vai trò",
        key: "changeRole",
      });
      console.error("Error changing role:", error);
    }
  };
  // Hàm giải tán nhóm
  const handleDisbandGroup = async () => {
    try {
      message.loading({
        content: "Đang giải tán nhóm...",
        key: "disbandGroup",
      });

      await dispatch(deleteGroup(selectedChat.id)).unwrap();
      socket.emit("delete-group", selectedChat.id);

      message.success({
        content: "Đã giải tán nhóm thành công",
        key: "disbandGroup",
      });

      setShowGroupSettingsModal(false);
      // Có thể cần chuyển hướng người dùng sau khi giải tán nhóm
      // Có thể cần chuyển hướng người dùng sau khi rời nhóm
      if (onLeaveGroup && typeof onLeaveGroup === "function") {
        onLeaveGroup();
      } else {
        // Nếu không có prop onLeaveGroup, sử dụng sự kiện tùy chỉnh
        window.dispatchEvent(
          new CustomEvent("group-left", {
            detail: { groupId: selectedChat.id },
          })
        );
      }

      // Đóng cửa sổ chi tiết hộp thoại nếu có
      if (typeof handleExpandContract === "function") {
        handleExpandContract(false);
      }
    } catch (error) {
      message.error({
        content: error.message || "Không thể giải tán nhóm",
        key: "disbandGroup",
      });
      console.error("Error disbanding group:", error);
    }
  };
  // Hàm cập nhật nhóm
  const updateGroupSettings = async () => {
    try {
      message.loading({ content: "Đang cập nhật...", key: "updateGroup" });

      // Cập nhật thông tin nhóm với cấu trúc mới
      const response = await dispatch(
        updateGroup({
          groupId: selectedChat.id,
          name: groupName,
          avatar: groupAvatar,
          allow_change_name: groupSettings.allow_change_name,
          allow_change_avatar: groupSettings.allow_change_avatar,
          currentUserId: user.id,
        })
      ).unwrap();
      socket.emit("update-group", {
        groupId: selectedChat.id,
        name: groupName,
        avatar: groupAvatar ? true : false, // Just indicate if avatar was changed
      });
      message.success({
        content: "Đã cập nhật thông tin nhóm thành công",
        key: "updateGroup",
      });

      // Cập nhật lại state
      fetchGroupMembers();
      fetchGroupSettings();
      

      setShowGroupSettingsModal(false);
      return response;
    } catch (error) {
      message.error({
        content: error.message || "Không thể cập nhật thông tin nhóm",
        key: "updateGroup",
      });
      console.error("Error updating group settings:", error);
    }
  };
  // Thêm hàm formatBytes ở đầu component
  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Thay đổi cách xử lý fileItems
  const fileItems = React.useMemo(() => {
    if (!allMessages) return [];

    const items = allMessages
      .filter((msg) => msg.type === "file")
      .map((msg) => {
        const fileUrl = msg.content;
        const fileName = decodeURIComponent(fileUrl.split("/").pop());
        const parts = fileName.split("-");
        const originalName =
          parts.length > 2 ? parts.slice(2).join("-") : fileName;
        const fileExt = originalName.split(".").pop().toLowerCase();

        // Determine file type and color
        let type = fileExt;
        let color = "gray";

        if (fileExt === "pdf") color = "red";
        else if (["zip", "rar", "7z"].includes(fileExt)) color = "purple";
        else if (["doc", "docx"].includes(fileExt)) color = "blue";
        else if (["xls", "xlsx"].includes(fileExt)) color = "green";
        else if (["ppt", "pptx"].includes(fileExt)) color = "orange";

        return {
          id: msg._id,
          name: originalName,
          url: fileUrl,
          type: fileExt,
          color,
          date: new Date(msg.timestamp).toLocaleDateString(),
          msg: msg, // Store the full message for accessing later
          size: "Đang lấy kích thước...", // Placeholder, will be updated after fetch
        };
      });

    return items;
  }, [allMessages]);

  // Thêm useEffect để lấy kích thước file
  React.useEffect(() => {
    const fetchFileSizes = async () => {
      const updatedFileItems = [...fileItems];

      for (let i = 0; i < updatedFileItems.length; i++) {
        const fileItem = updatedFileItems[i];
        try {
          const response = await fetch(fileItem.url, { method: "HEAD" });
          const sizeHeader = response.headers.get("Content-Length");

          if (sizeHeader) {
            fileItem.size = formatBytes(Number(sizeHeader));
          } else {
            fileItem.size = "Không xác định";
          }
        } catch (error) {
          console.error(`Lỗi khi lấy kích thước file ${fileItem.name}:`, error);
          fileItem.size = "Không xác định";
        }
      }

      // Cập nhật state chỉ khi component vẫn mounted
      setFileItems(updatedFileItems);
    };

    if (fileItems.length > 0) {
      fetchFileSizes();
    }
  }, [fileItems.length]);

  const mediaItems = allMessages
    ? allMessages
        .filter((msg) => msg.type === "image" || msg.type === "video")
        .map((msg) => ({
          id: msg._id,
          type: msg.type,
          url: msg.content,
          timestamp: msg.timestamp,
        }))
    : [];
  const linkItems = allMessages
    ? allMessages
        .filter(
          (msg) =>
            msg.type === "text" &&
            msg.content &&
            msg.content.match(/https?:\/\/[^\s]+/g)
        )
        .flatMap((msg) => {
          const links = msg.content.match(/https?:\/\/[^\s]+/g) || [];
          return links.map((link, index) => ({
            id: `${msg._id}-${index}`,
            url: link,
            title: getDomainFromUrl(link),
            date: new Date(msg.timestamp).toLocaleDateString(),
          }));
        })
    : [];

  // Helper function to extract domain from URL
  function getDomainFromUrl(url) {
    try {
      return new URL(url).hostname;
    } catch (e) {
      return url;
    }
  }
  // Tìm bạn bè
  const fetchFriends = async () => {
    try {
      const response = await axios.get(
        `http://${window.location.hostname}:5001/api/friendships/${user.id}`
      );
      // console.log("Friends response:", response.data.friends);

      if (response.data && response.data.friends) {
        // Lọc ra bạn bè chưa có trong nhóm
        const existingMemberIds = groupMembers.map((member) => member.user_id);
        const availableFriends = response.data.friends.filter(
          (friend) => !existingMemberIds.includes(friend.id || friend._id)
        );
        setFriends(availableFriends);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
      message.error("Không thể lấy danh sách bạn bè");
    }
  };

  // Gọi hàm này khi mở modal thêm thành viên
  useEffect(() => {
    if (showAddMembersModal) {
      fetchFriends();
    }
  }, [showAddMembersModal]);
  useEffect(() => {
    if (!isExpanded) setActiveTab(activeTabFromMessageArea);
  }, [activeTabFromMessageArea, isExpanded]);

  // Reset nickname when selected chat changes
  useEffect(() => {
    setNickname(selectedChat?.name || "");
  }, [selectedChat]);

  // Fetch group members if it's a group chat
  useEffect(() => {
    if (selectedChat?.chat_type === "group" && selectedChat?.id) {
      fetchGroupMembers();
      fetchGroupSettings();
      fetchMemberApprovalStatus(); // lấy trạng thái chờ duyệt
    }
  }, [selectedChat]);
  // Effect modal thành viên chờ duyệt
  useEffect(() => {
    if (showPendingMembersModal && selectedChat?.id) {
      fetchPendingMembers();
      fetchInvitedMembers();
    }
  }, [showPendingMembersModal]);
  // Thêm hàm để lấy cài đặt nhóm
  const fetchGroupSettings = async () => {
    try {
      const response = await dispatch(getGroupById(selectedChat.id)).unwrap();

      if (response) {
        setGroupSettings({
          allow_change_name: response.allow_change_name,
          allow_change_avatar: response.allow_change_avatar,
        });

        // Cập nhật tên nhóm và biểu tượng
        setGroupName(response.name);
        setIsMainAdmin(response.admin_id === user.id);
      }
    } catch (error) {
      console.error("Error fetching group settings:", error);
    }
  };
  // Function to fetch group members
  const fetchGroupMembers = async () => {
    try {
      // Modify this to use your actual API endpoint
      const response = await axios.get(
        `http://${window.location.hostname}:5001/api/groups/${selectedChat.id}/members`
      );
      // console.log("Group members response:", response);

      if (response.data && Array.isArray(response.data.data)) {
        setGroupMembers(response.data.data);

        // Check if current user is admin
        const currentUser = response.data.data.find(
          (member) => member.user_id === user.id || member.user_id === user._id
        );

        setIsAdmin(currentUser?.role === "admin");
        // Kiểm tra nếu người dùng là sub-admin
        // Sub-admin là thành viên có role admin nhưng không phải admin chính
        // const isUserSubAdmin = currentUser?.role === "admin" && !isMainAdmin;
        // setIsSubAdmin(isUserSubAdmin);
      }
    } catch (error) {
      console.error("Error fetching group members:", error);
    }
  };

  const handleShowModalSetNickName = () => {
    setShowModalSetNickName(!showModalSetNickName);
    // When opening the modal, focus and select all text in the input
    if (!showModalSetNickName) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 100);
    }
  };

  const handleSaveNickname = async () => {
    try {
      // Implement API call to save nickname
      // const response = await axios.put(...);

      // For now, just show success message
      message.success(`Đã đổi tên gợi nhớ thành: ${nickname}`);
      setShowModalSetNickName(false);
    } catch (error) {
      message.error("Không thể lưu tên gợi nhớ. Vui lòng thử lại.");
    }
  };

  const handleExpandContractWrapper = () => {
    handleExpandContract();
  };

  const handleGifSelect = async (gifUrl) => {
    try {
      const response = await fetch(gifUrl);
      const gifBlob = await response.blob();
      const gifFile = new File([gifBlob], `gif_${Date.now()}.gif`, {
        type: "image/gif",
      });
      onImageUpload(gifFile);

      if (isExpanded) {
        setActiveTab("info");
      }
    } catch (error) {
      console.error("Error processing GIF:", error);
      message.error("Không thể gửi GIF. Vui lòng thử lại.");
    }
  };

  const onEmojiClick = (event) => {
    const emoji = event.emoji;
    if (emoji) {
      setInputMessage((prevMessage) => prevMessage + emoji);
    }
  };
  // Hàm xoá thành viên cho admin
  const handleRemoveMember = async (userId, userName, isTargetAdmin) => {
    // Nếu là nhóm phó và đang cố xóa một nhóm phó khác
    //  if (isSubAdmin && !isMainAdmin && isAdmin) {
    //   return message.error("Bạn không có quyền xóa nhóm trưởng hoặc nhóm phó khác");
    //  }
    if (isSubAdmin && isTargetAdmin) {
      return message.error(
        "Bạn không có quyền xóa nhóm trưởng hoặc nhóm phó khác"
      );
    }
    try {
      Modal.confirm({
        title: "Xác nhận xóa thành viên",
        content: `Bạn có chắc chắn muốn xóa ${userName} khỏi nhóm?`,
        okText: "Xóa",
        okType: "danger",
        cancelText: "Hủy",
        onOk: async () => {
          message.loading({
            content: "Đang xóa thành viên...",
            key: "removeMember",
          });

          await dispatch(
            removeMember({
              groupId: selectedChat.id,
              userId: userId,
              adminId: user.id,
            })
          ).unwrap();
          socket.emit("remove-member", {
            groupId: selectedChat.id,
            userId: userId,
          });
          await dispatch(getUserMessages(selectedChat.id));
          message.success({
            content: "Đã xóa thành viên khỏi nhóm",
            key: "removeMember",
          });

          // Cập nhật lại danh sách thành viên
          fetchGroupMembers();
        },
      });
    } catch (error) {
      message.error({
        content: error.message || "Không thể xóa thành viên",
        key: "removeMember",
      });
      console.error("Error removing member:", error);
    }
  };
  // Hàm thêm thành viên
  const handleAddMembers = async () => {
    try {
      if (selectedMembers.length === 0) {
        return message.info("Vui lòng chọn ít nhất một thành viên");
      }

      message.loading({
        content: "Đang thêm thành viên...",
        key: "addMembers",
      });

      await dispatch(
        addMembers({
          groupId: selectedChat.id,
          userIds: selectedMembers,
          inviterId: user.id, // ID của người mời (người dùng hiện tại)
        })
      ).unwrap();
      socket.emit("add-members", {
        groupId: selectedChat.id,
        userIds: selectedMembers,
      }); 
      // console.log("Selected đã chọn cho handel Message:", selectedChat.id);
      await dispatch(
        fetchChatMessages({
          senderId: user.id || user._id,
          receiverId: selectedChat.id,
        })
      ).unwrap();
      message.success({
        content: `Đã thêm ${selectedMembers.length} thành viên vào nhóm`,
        key: "addMembers",
      });

      // Cập nhật lại danh sách thành viên
      fetchGroupMembers();
      setShowAddMembersModal(false);
      setSelectedMembers([]);
    } catch (error) {
      message.error({
        content: error.message || "Không thể thêm thành viên",
        key: "addMembers",
      });
      console.error("Error adding members:", error);
    }
  };

  // Hàm rời nhóm
  const handleLeaveGroup = async () => {
    try {
      // Nếu là admin chính, yêu cầu chuyển nhượng quyền trước
      if (isMainAdmin) {
        setShowTransferAdminModal(true);
        return; // Dừng lại, không rời nhóm ngay
      }
      // Nếu không phải admin chính, tiến hành rời nhóm bình thường
      message.loading({ content: "Đang rời nhóm...", key: "leaveGroup" });

      await dispatch(
        removeMember({
          groupId: selectedChat.id,
          userId: user.id,
          adminId: user.id,
        })
      ).unwrap();
      socket.emit("leave-group", {
        groupId: selectedChat.id,
        userId: user.id,
      });
      message.success({
        content: "Đã rời nhóm thành công",
        key: "leaveGroup",
      });
      await dispatch(fetchMessages(user.id || user._id)).unwrap();
      // await dispatch(fetchChatMessages(user.id || user._id)).unwrap();

      setShowLeaveGroupModal(false);
      // Có thể cần chuyển hướng người dùng sau khi rời nhóm
      if (onLeaveGroup && typeof onLeaveGroup === "function") {
        onLeaveGroup();
      } else {
        // Nếu không có prop onLeaveGroup, sử dụng sự kiện tùy chỉnh
        window.dispatchEvent(
          new CustomEvent("group-left", {
            detail: { groupId: selectedChat.id },
          })
        );
      }

      // Đóng cửa sổ chi tiết hộp thoại nếu có
      if (typeof handleExpandContract === "function") {
        handleExpandContract(false);
      }
    } catch (error) {
      message.error({
        content: error.message || "Không thể rời nhóm",
        key: "leaveGroup",
      });
      console.error("Error leaving group:", error);
    }
  };
  // Hàm chuyển nhượng admin và rời nhóm
  const handleTransferAdminAndLeave = async () => {
    if (!newAdminId) {
      return message.error(
        "Vui lòng chọn một thành viên để chuyển quyền admin"
      );
    }

    try {
      message.loading({
        content: "Đang chuyển quyền admin...",
        key: "transferAdmin",
      });

      // Chuyển quyền admin cho thành viên mới
      await dispatch(
        transferAdmin({
          groupId: selectedChat.id,
          userId: newAdminId,
          currentAdminId: user.id,
        })
      ).unwrap();
      socket.emit("transfer-admin", {
        groupId: selectedChat.id,
        userId: newAdminIdForTransfer,
      });
      message.success({
        content: "Đã chuyển quyền admin thành công",
        key: "transferAdmin",
      });

      // Sau khi chuyển quyền thành công, tiến hành rời nhóm
      message.loading({ content: "Đang rời nhóm...", key: "leaveGroup" });

      await dispatch(
        removeMember({
          groupId: selectedChat.id,
          userId: user.id,
          adminId: user.id,
        })
      ).unwrap();

      message.success({
        content: "Đã rời nhóm thành công",
        key: "leaveGroup",
      });

      // Cập nhật danh sách tin nhắn
      await dispatch(fetchMessages(user.id || user._id)).unwrap();

      // Đóng modal và cửa sổ
      setShowTransferAdminModal(false);
      setShowLeaveGroupModal(false);

      // Thông báo đã rời nhóm
      if (onLeaveGroup && typeof onLeaveGroup === "function") {
        onLeaveGroup();
      } else {
        window.dispatchEvent(
          new CustomEvent("group-left", {
            detail: { groupId: selectedChat.id },
          })
        );
      }

      // Đóng cửa sổ chi tiết
      if (typeof handleExpandContract === "function") {
        handleExpandContract(false);
      }
    } catch (error) {
      message.error({
        content: error.message || "Không thể chuyển quyền hoặc rời nhóm",
        key: "transferAdmin",
      });
      console.error("Error transferring admin or leaving group:", error);
    }
  };

  const handleDeleteHistory = async () => {
    try {
      // Implementation for deleting chat history
      // await axios.delete(...);
      message.success("Đã xóa lịch sử trò chuyện");
      setShowDeleteHistoryModal(false);
    } catch (error) {
      message.error("Không thể xóa lịch sử trò chuyện. Vui lòng thử lại.");
    }
  };

  const visibleMedia = showAll ? mediaItems : mediaItems.slice(0, 8);
  // console.log("Group members:", groupMembers);
  // console.log("Selected chat:", selectedChat);
  // console.log("Pending members:", pendingMembers);

  // useEffect for group-specific socket events
  useEffect(() => {
    if (!selectedChat?.id || selectedChat.chat_type !== "group") return;
    // Tham gia phòng quản lý nhóm - chỉ dùng groupId trực tiếp
    // console.log("Joining group management room:", selectedChat.id);
    socket.emit("join-room", selectedChat.id); // Không cần prefix "group_"

    // Define a prefix for easier logging
    const logPrefix = "[Group Socket]";

    // Function to handle general member updates that require refetching members
    const handleMemberUpdate = (data) => {
      if (data.groupId === selectedChat.id) {
        fetchGroupMembers();
        fetchPendingMembers();
        dispatch(getUserMessages(selectedChat.id));
      }
    };

    // Listen for member approval status change
    const handleApprovalUpdate = (data) => {
      if (data.groupId === selectedChat.id) {
        // console.log(`${logPrefix} Approval setting updated:`, data);
        setRequireApproval(data.requireApproval);
      }
    };

    // Group info updates
    const handleGroupUpdate = (data) => {
      if (data.groupId === selectedChat.id) {
        // console.log(`${logPrefix} Group info updated:`, data);
        fetchGroupSettings();
        // If onUpdateSelectedChat exists, update the group name
        if (typeof onUpdateSelectedChat === "function" && data.name) {
          onUpdateSelectedChat({
            ...selectedChat,
            name: data.name,
          });
        }
      }
    };

    // Handle admin transfer
    const handleAdminTransfer = (data) => {
      if (data.groupId === selectedChat.id) {
        // console.log(`${logPrefix} Admin transferred:`, data);
        fetchGroupMembers();
        fetchGroupSettings();
        // Update isMainAdmin status if current user is the new admin
        setIsMainAdmin(data.userId === user.id);
      }
    };

    // Handle group deletion
    const handleGroupDeleted = (groupId) => {
      if (groupId === selectedChat.id) {
        // console.log(`${logPrefix} Group was deleted:`, groupId);
        message.info("Nhóm đã bị giải tán bởi quản trị viên.");
        if (onLeaveGroup && typeof onLeaveGroup === "function") {
          onLeaveGroup();
        } else {
          window.dispatchEvent(
            new CustomEvent("group-left", {
              detail: { groupId: selectedChat.id },
            })
          );
        }
      }
    };

    // Register listeners
    socket.on("members-added", handleMemberUpdate);
    socket.on("member-removed", handleMemberUpdate);
    socket.on("member-accepted", handleMemberUpdate);
    socket.on("member-rejected", handleMemberUpdate);
    socket.on("member-left", handleMemberUpdate);
    socket.on("member-approval-updated", handleApprovalUpdate);
    socket.on("group-updated", handleGroupUpdate);
    socket.on("admin-transferred", handleAdminTransfer);
    socket.on("group-deleted", handleGroupDeleted);

    // Clean up listeners when component unmounts or selectedChat changes
    return () => {
      socket.off("members-added", handleMemberUpdate);
      socket.off("member-removed", handleMemberUpdate);
      socket.off("member-accepted", handleMemberUpdate);
      socket.off("member-rejected", handleMemberUpdate);
      socket.off("member-left", handleMemberUpdate);
      socket.off("member-approval-updated", handleApprovalUpdate);
      socket.off("group-updated", handleGroupUpdate);
      socket.off("admin-transferred", handleAdminTransfer);
      socket.off("group-deleted", handleGroupDeleted);
    };
  }, [selectedChat?.id, selectedChat?.chat_type, user.id]);
  // 4. cleanup URL preview avatar
useEffect(() => {
  return () => {
    // Cleanup URL khi component unmount
    if (groupAvatarPreview) {
      URL.revokeObjectURL(groupAvatarPreview);
    }
    if (newGroupAvatarPreview && newGroupAvatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(newGroupAvatarPreview);
    }
  };
}, []);
  if (!isVisible) return null;

  return (
    <div className="conversation-details">
      <div className="header">
        {isExpanded ? (
          <div className="header" style={{ display: "flex", width: "100%" }}>
            <h2
              className={activeTab === "info" ? "active-tab" : ""}
              onClick={() => setActiveTab("info")}
            >
              Thông tin
            </h2>
            <h2
              className={activeTab === "icons" ? "active-tab" : ""}
              onClick={() => setActiveTab("icons")}
            >
              Biểu tượng
            </h2>
            <GrContract
              className="icon-close"
              onClick={handleExpandContractWrapper}
            />
          </div>
        ) : (
          <h2 style={{ backgroundColor: "white", width: "100%" }}>
            Thông tin hộp thoại
          </h2>
        )}
      </div>
      <div className="content-conversation-details">
        {activeTab === "info" && (
          <div>
            <div className="chat-info-header">
              <div className="avatar">
                <Avatar size={60} src={selectedChat.avatar_path}>
                  {!selectedChat.avatar_path &&
                    (selectedChat.name || "User").charAt(0).toUpperCase()}
                </Avatar>
              </div>
              <h3>
                {selectedChat.name}
                {selectedChat.chat_type !== "group" && (
                  <EditOutlined
                    className="icon-edit"
                    onClick={handleShowModalSetNickName}
                  />
                )}
              </h3>
            </div>

            <div className="action-buttons">
              <div className="notification-layout">
                <button className="conversation-action-button">
                  <BellOutlined className="icon-notification" />
                </button>
                <span>
                  Tắt <br /> thông báo
                </span>
              </div>
              <div>
                <button className="conversation-action-button">
                  <PushpinOutlined />
                </button>
                <span>
                  Ghim <br /> hộp thoại
                </span>
              </div>

              {selectedChat.chat_type === "group" ? (
                <>
                  <div>
                    <button
                      className="conversation-action-button"
                      onClick={() => {
                        setShowAddMembersModal(true);
                      }}
                    >
                      <UserAddOutlined />
                    </button>
                    <span style={{ width: "74px" }}>Thêm thành viên</span>
                  </div>
                  <div>
                    <button
                      className="conversation-action-button"
                      onClick={() => setShowGroupSettingsModal(true)}
                    >
                      <SettingOutlined />
                    </button>
                    <span>
                      Quản lý
                      <br />
                      nhóm
                    </span>
                  </div>
                  <div>
                    <button
                      className="conversation-action-button"
                      onClick={() => setShowInviteModal(true)}
                    >
                      <ShareAltOutlined />
                    </button>
                    <span>
                      Chia sẻ
                      <br />
                      nhóm
                    </span>
                  </div>
                </>
              ) : (
                <div>
                  <button
                    className="conversation-action-button"
                    onClick={handleCreateGroupClick}
                  >
                    <UsergroupAddOutlined />
                  </button>
                  <span>
                    Tạo nhóm <br /> trò chuyện
                  </span>
                </div>
              )}
            </div>
            {/* {selectedChat.chat_type === "group" && (
                <div style={{display:"flex",background:"cyan",boxShadow:"-moz-initial"}}>
                  <button 
                    className="conversation-action-button"
                    style={{
                      width: "50px",
                      backgroundColor: "cyan",
                      
                    }}
                    onClick={() => setShowInviteModal(true)}
                  >
                    <ShareAltOutlined />
                  </button>
                  <span>
                    Chia sẻ<br />nhóm
                  </span>
                </div>
              )} */}
            {/* Modal thêm thành viên */}
            <Modal
              title="Thêm thành viên vào nhóm"
              open={showAddMembersModal}
              onCancel={() => setShowAddMembersModal(false)}
              footer={[
                <Button
                  key="cancel"
                  onClick={() => setShowAddMembersModal(false)}
                >
                  Hủy
                </Button>,
                <Button
                  key="add"
                  type="primary"
                  disabled={selectedMembers.length === 0}
                  onClick={handleAddMembers}
                >
                  Thêm ({selectedMembers.length})
                </Button>,
              ]}
              width={500}
            >
              <Input
                placeholder="Tìm kiếm bạn bè..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: 15 }}
              />

              <div
                className="friends-list"
                style={{ maxHeight: "300px", overflowY: "auto" }}
              >
                {friends
                  .filter(
                    (friend) =>
                      friend.full_name
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      friend.name
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase())
                  )
                  .map((friend) => (
                    <div
                      key={friend.id || friend._id}
                      className="friend-item"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "10px",
                        borderBottom: "1px solid #f0f0f0",
                        justifyContent: "flex-start",
                      }}
                    >
                      <Checkbox
                        checked={selectedMembers.includes(
                          friend.id || friend._id
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMembers([
                              ...selectedMembers,
                              friend.id || friend._id,
                            ]);
                          } else {
                            setSelectedMembers(
                              selectedMembers.filter(
                                (id) => id !== (friend.id || friend._id)
                              )
                            );
                          }
                        }}
                      />
                      <Avatar
                        src={friend.avatar_path}
                        style={{ marginLeft: 10, marginRight: 10 }}
                      >
                        {(friend.full_name || friend.name || "User")
                          .charAt(0)
                          .toUpperCase()}
                      </Avatar>
                      <span>{friend.full_name || friend.name}</span>
                    </div>
                  ))}
                {friends.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px 0",
                      color: "#999",
                    }}
                  >
                    Không tìm thấy bạn bè nào để thêm vào nhóm
                  </div>
                )}
              </div>
            </Modal>

            {/* Modal cài đặt nhóm */}
            <Modal
              title="Quản lý nhóm"
              open={showGroupSettingsModal}
              onCancel={() => setShowGroupSettingsModal(false)}
              footer={[
                <Button
                  key="cancel"
                  onClick={() => setShowGroupSettingsModal(false)}
                >
                  Hủy
                </Button>,
                <Button key="save" type="primary" onClick={updateGroupSettings}>
                  Lưu thay đổi
                </Button>,
              ]}
              width={500}
               bodyStyle={{
                maxHeight: "calc(90vh - 110px)", // 90% viewport height trừ đi khoảng cho header và footer
                overflowY: "auto", // Cho phép cuộn dọc khi nội dung vượt quá
                paddingRight: "16px", // Thêm padding bên phải để tránh nội dung bị che bởi thanh cuộn
                scrollbarWidth: "none", // Firefox
                msOverflowStyle: "none", // IE/Edge
              }}
            >
              <div style={{ marginBottom: 20 }}>
                <h4>Thông tin cơ bản</h4>
                <div
                  style={{
                    display: "flex",
                    marginBottom: 15,
                    alignItems: "center",
                  }}
                >
                  <div style={{ marginRight: 15 }}>
                  <Avatar
                    size={64}
                    src={groupAvatarPreview || selectedChat.avatar_path}
                    style={{
                      cursor: canChangeAvatar() ? "pointer" : "default",
                    }}
                    onClick={() => {
                      if (canChangeAvatar()) {
                        document.getElementById("group-avatar-upload").click();
                      } else if (!isMainAdmin && !isSubAdmin) {
                        message.info("Chỉ quản trị viên mới có quyền thay đổi ảnh nhóm");
                      }
                    }}
                  >
                    {!groupAvatarPreview && !selectedChat.avatar_path &&
                      (selectedChat.name || "G").charAt(0).toUpperCase()}
                  </Avatar>
                    <input
                      type="file"
                      id="group-avatar-upload"
                      hidden
                      disabled={!canChangeAvatar()}
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          const file = e.target.files[0];
                          setGroupAvatar(file);
                          // Tạo URL preview
                          const previewUrl = URL.createObjectURL(file);
                          setGroupAvatarPreview(previewUrl);
                        }
                      }}
                    />
                    {canChangeAvatar() && (
                      <div style={{ textAlign: "center", marginTop: 5 }}>
                        <Button
                          type="text"
                          icon={<UploadOutlined />}
                          size="small"
                          onClick={() => {
                            if (canChangeAvatar()) {
                              document
                                .getElementById("group-avatar-upload")
                                .click();
                            } else if (!isMainAdmin && !isSubAdmin) {
                              message.info(
                                "Chỉ quản trị viên mới có quyền thay đổi ảnh nhóm"
                              );
                            }
                          }}
                        >
                          Đổi ảnh
                        </Button>
                      </div>
                    )}
                  </div>
                  <Input
                    placeholder="Tên nhóm"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    style={{ flex: 1 }}
                    disabled={!canChangeName()}
                  />
                </div>
              </div>

              {isMainAdmin && (
                <>
                  <Divider />
                  <div style={{ marginBottom: 20 }}>
                    <h4>Cài đặt thành viên</h4>
                    <div style={{ marginBottom: 10 }}>
                      <Checkbox
                        checked={requireApproval}
                        // onChange={e => setRequireApproval(e.target.checked)}
                        onChange={(e) =>
                          handleUpdateApprovalSetting(e.target.checked)
                        }
                        disabled={memberApprovalLoading}
                      >
                        Yêu cầu phê duyệt khi có thành viên mới muốn tham gia
                      </Checkbox>
                      {memberApprovalLoading && (
                        <Spin size="small" style={{ marginLeft: 8 }} />
                      )}
                    </div>

                    

                    <div style={{ marginBottom: 10 }}>
                      <Checkbox
                        checked={groupSettings.allow_change_name}
                        onChange={(e) => {
                          setGroupSettings({
                            ...groupSettings,
                            allow_change_name: e.target.checked,
                          });
                        }}
                      >
                        Cho phép thành viên thay đổi tên nhóm
                      </Checkbox>
                    </div>

                    <div style={{ marginBottom: 10 }}>
                      <Checkbox
                        checked={groupSettings.allow_change_avatar}
                        onChange={(e) => {
                          setGroupSettings({
                            ...groupSettings,
                            allow_change_avatar: e.target.checked,
                          });
                        }}
                      >
                        Cho phép thành viên thay đổi ảnh nhóm
                      </Checkbox>
                    </div>
                  </div>
                </>
              )}

              <Divider />

              <div style={{ marginBottom: 20 }}>
                <h4>Quản lý vai trò</h4>
                <div className="admin-section">
                  {groupMembers.slice(0, 5).map((member) => (
                    <div
                      key={member.user_id}
                      className="member-item"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 0",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          src={member.avatar_path}
                          style={{ marginRight: 10 }}
                        >
                          {!member.avatar_path &&
                            (member.full_name || "User")
                              .charAt(0)
                              .toUpperCase()}
                        </Avatar>
                        {/* <span>
                              {member.full_name}
                              {member.user_id === selectedChat.admin_id && (
                                <span style={{ marginLeft: 5, color: '#1890ff' }}>(Nhóm trưởng)</span>
                              )}
                            </span> */}
                        <span>
                          {member.full_name}
                          {member.user_id === selectedChat.admin_id && (
                            <span style={{ marginLeft: 5, color: "#1890ff" }}>
                              (Nhóm trưởng)
                            </span>
                          )}
                          {member.role === "admin" &&
                            member.user_id !== selectedChat.admin_id && (
                              <span style={{ marginLeft: 5, color: "#52c41a" }}>
                                (Nhóm phó)
                              </span>
                            )}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <Select
                          defaultValue={member.role || "member"}
                          style={{ width: 120 }}
                          disabled={
                            // Không thể đổi vai trò của chính mình
                            member.user_id === user.id ||
                            member.user_id === user._id ||
                            // Không thể đổi vai trò của admin chính nếu mình không phải admin chính
                            (member.user_id === selectedChat.admin_id &&
                              user.id !== selectedChat.admin_id) ||
                            // Cần là admin hoặc subadmin để thay đổi vai trò
                            !isMainAdmin
                          }
                          onChange={(value) =>
                            handleChangeRole(member.user_id, value)
                          }
                        >
                          <Select.Option value="admin">
                            Quản trị viên
                          </Select.Option>
                          <Select.Option value="member">
                            Thành viên
                          </Select.Option>
                        </Select>

                        {/* Nút xóa thành viên */}
                        {(isMainAdmin ||
                          (isSubAdmin && member.role !== "admin")) &&
                          member.user_id !== user.id &&
                          member.user_id !== selectedChat.admin_id && (
                            <Button
                              icon={<DeleteOutlined />}
                              danger
                              onClick={() =>
                                handleRemoveMember(
                                  member.user_id,
                                  member.full_name,
                                  member.role === "admin"
                                )
                              }
                              size="small"
                            />
                          )}
                        {/* {(isMainAdmin || 
                                (isAdmin === true && isMainAdmin === false && member.role !== "admin")) && 
                                member.user_id !== user.id && 
                                member.user_id !== selectedChat.admin_id && (
                                  <Button 
                                    icon={<DeleteOutlined />} 
                                    danger
                                    onClick={() => handleRemoveMember(member.user_id, member.full_name, member.role === "admin")}
                                    size="small"
                                  />
                              )} */}
                      </div>
                    </div>
                  ))}

                  {groupMembers.length > 5 && (
                    <Button type="link" style={{ padding: "10px 0" }}>
                      Xem tất cả thành viên
                    </Button>
                  )}
                </div>
              </div>

              {isMainAdmin && (
                <>
                  <Divider />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 15,
                    }}
                  >
                    <Button
                      type="primary"
                      icon={<UserOutlined />}
                      onClick={() => setShowTransferAdminChooserModal(true)}
                    >
                      Chuyển quyền nhóm trưởng
                    </Button>

                    <Button
                      danger
                      onClick={() => {
                        Modal.confirm({
                          title: "Xác nhận giải tán nhóm",
                          content:
                            "Bạn có chắc chắn muốn giải tán nhóm này? Hành động này không thể hoàn tác.",
                          okText: "Giải tán",
                          okType: "danger",
                          cancelText: "Hủy",
                          onOk: handleDisbandGroup,
                        });
                      }}
                    >
                      <DeleteOutlined /> Giải tán nhóm
                    </Button>
                  </div>
                </>
              )}
              {isMainAdmin ||
                (isSubAdmin && (
                  <>
                    <div
                      className="select-wrapper"
                      onClick={() => setIsOpenMembers(!isOpenMembers)}
                    >
                      <h3>
                        Thành viên nhóm ({groupMembers.length})
                        {pendingMembers.length > 0 && isAdmin && (
                          <Badge
                            count={pendingMembers.length}
                            style={{
                              backgroundColor: "#ff4d4f",
                              marginLeft: 8,
                            }}
                            title={`${pendingMembers.length} yêu cầu tham gia đang chờ duyệt`}
                          />
                        )}
                      </h3>
                      {isOpenMembers ? (
                        <FaCaretDown className="anticon" />
                      ) : (
                        <FaCaretRight className="anticon" />
                      )}
                    </div>
                    {isAdmin && pendingMembers.length > 0 && (
                      <Button
                        type="primary"
                        size="small"
                        icon={<UserOutlined />}
                        style={{ margin: "10px 0" }}
                        onClick={() => setShowPendingMembersModal(true)}
                      >
                        {pendingMembers.length} yêu cầu tham gia mới
                      </Button>
                    )}
                  </>
                ))}
              {
                <div style={{ marginTop: 15 }}>
                  <Button
                    type="primary"
                    icon={<UserOutlined />}
                    onClick={() => setShowPendingMembersModal(true)}
                  >
                    Quản lý yêu cầu tham gia
                    {pendingMembers.length > 0 && (
                      <Badge
                        count={pendingMembers.length}
                        offset={[5, -5]}
                        style={{ backgroundColor: "#ff4d4f" }}
                      />
                    )}
                  </Button>
                </div>
              }
            </Modal>
            {/* Modal quản lý yêu cầu tham gia và thành viên đã mời */}
            {/* <Modal
                    title="Quản lý thành viên"
                    open={showPendingMembersModal}
                    onCancel={() => setShowPendingMembersModal(false)}
                    footer={[
                      <Button key="close" onClick={() => setShowPendingMembersModal(false)}>
                        Đóng
                      </Button>
                    ]}
                    width={600}
                  >
                    <Tabs 
                      activeKey={membersTabActive} 
                      onChange={setMembersTabActive}
                      items={[
                        {
                          key: 'pending',
                          label: (
                            <span>
                              Yêu cầu tham gia
                              {pendingMembers.length > 0 && (
                                <Badge 
                                  count={pendingMembers.length} 
                                  style={{ backgroundColor: '#ff4d4f', marginLeft: 8 }}
                                />
                              )}
                            </span>
                          ),
                          children: (
                            <>
                              {pendingMembersLoading ? (
                                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                                  <Spin />
                                  <div style={{ marginTop: 10, color: '#999' }}>Đang tải danh sách...</div>
                                </div>
                              ) : pendingMembers.length > 0 ? (
                                <List
                                  itemLayout="horizontal"
                                  dataSource={pendingMembers}
                                  renderItem={member => (
                                    <List.Item
                                      actions={[
                                        <Button 
                                          type="primary" 
                                          size="small" 
                                          onClick={() => handleAcceptMember(member.user_id, member.member.full_name)}
                                        >
                                          Chấp nhận
                                        </Button>,
                                        <Button 
                                          danger 
                                          size="small" 
                                          onClick={() => handleRejectMember(member.user_id, member.member.full_name)}
                                        >
                                          Từ chối
                                        </Button>
                                      ]}
                                    >
                                      <List.Item.Meta
                                        avatar={<Avatar src={member.member.avatar_path}>
                                          {!member.member.avatar_path && member.member.full_name?.charAt(0).toUpperCase()}
                                        </Avatar>}
                                        title={member.member.full_name}
                                        description={
                                          <span>
                                            Yêu cầu tham gia vào {new Date(member.requested_at).toLocaleString()}
                                          </span>
                                        }
                                      />
                                    </List.Item>
                                  )}
                                />
                              ) : (
                                <Empty 
                                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                                  description="Không có yêu cầu tham gia nào" 
                                />
                              )}
                            </>
                          )
                        },
                        {
                          key: 'invited',
                          label: 'Thành viên đã mời',
                          children: (
                            <>
                              {invitedMembers.length > 0 ? (
                                <List
                                  itemLayout="horizontal"
                                  dataSource={invitedMembers}
                                  renderItem={member => (
                                    <List.Item>
                                      <List.Item.Meta
                                        avatar={<Avatar src={member.member.avatar_path}>
                                          {!member.member.avatar_path && member.member.full_name?.charAt(0).toUpperCase()}
                                        </Avatar>}
                                        title={member.member.full_name || member.phone || 'Không có tên'}
                                        description={
                                          <span>
                                            Đã mời vào {new Date(member.joined_at).toLocaleString()}
                                            {member.status === 'pending' && ' - Đang chờ chấp nhận'}
                                            {member.status === 'approved' && ' - Đã chấp nhận'}
                                            {member.status === '' && ' - Đã từ chối'}
                                          </span>
                                        }
                                      />
                                    </List.Item>
                                  )}
                                />
                              ) : (
                                <Empty 
                                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                                  description="Bạn chưa mời ai vào nhóm này" 
                                />
                              )}
                            </>
                          )
                        }
                      ]}
                    />
                  </Modal> */}
            <Modal
              title="Quản lý thành viên"
              open={showPendingMembersModal}
              onCancel={() => setShowPendingMembersModal(false)}
              footer={[
                <Button
                  key="close"
                  onClick={() => setShowPendingMembersModal(false)}
                >
                  Đóng
                </Button>,
              ]}
              width={600}
            >
              <Tabs
                activeKey={isAdmin ? membersTabActive : "invited"}
                onChange={isAdmin ? setMembersTabActive : undefined}
                items={[
                  // Only show pending tab for admins
                  ...(isAdmin || isSubAdmin
                    ? [
                        {
                          key: "pending",
                          label: (
                            <span>
                              Yêu cầu tham gia
                              {pendingMembers.length > 0 && (
                                <Badge
                                  count={pendingMembers.length}
                                  style={{
                                    backgroundColor: "#ff4d4f",
                                    marginLeft: 8,
                                  }}
                                />
                              )}
                            </span>
                          ),
                          children: (
                            <>
                              {pendingMembersLoading ? (
                                <div
                                  style={{
                                    textAlign: "center",
                                    padding: "30px 0",
                                  }}
                                >
                                  <Spin />
                                  <div style={{ marginTop: 10, color: "#999" }}>
                                    Đang tải danh sách...
                                  </div>
                                </div>
                              ) : pendingMembers.length > 0 ? (
                                <List
                                  itemLayout="horizontal"
                                  dataSource={pendingMembers}
                                  renderItem={(member) => (
                                    <List.Item
                                      actions={[
                                        <Button
                                          type="primary"
                                          size="small"
                                          onClick={() =>
                                            handleAcceptMember(
                                              member.user_id,
                                              member.member.full_name
                                            )
                                          }
                                        >
                                          Chấp nhận
                                        </Button>,
                                        <Button
                                          danger
                                          size="small"
                                          onClick={() =>
                                            handleRejectMember(
                                              member.user_id,
                                              member.member.full_name
                                            )
                                          }
                                        >
                                          Từ chối
                                        </Button>,
                                      ]}
                                    >
                                      <List.Item.Meta
                                        avatar={
                                          <Avatar
                                            src={member.member.avatar_path}
                                          >
                                            {!member.member.avatar_path &&
                                              member.member.full_name
                                                ?.charAt(0)
                                                .toUpperCase()}
                                          </Avatar>
                                        }
                                        title={member.member.full_name}
                                        description={
                                          <span>
                                            Yêu cầu tham gia vào{" "}
                                            {new Date(
                                              member.requested_at
                                            ).toLocaleString()}
                                          </span>
                                        }
                                      />
                                    </List.Item>
                                  )}
                                />
                              ) : (
                                <Empty
                                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                                  description="Không có yêu cầu tham gia nào"
                                />
                              )}
                            </>
                          ),
                        },
                      ]
                    : []), // If not admin, don't include this tab
                  {
                    key: "invited",
                    label: "Thành viên đã mời",
                    children: (
                      <>
                        {invitedMembers.length > 0 ? (
                          <List
                            itemLayout="horizontal"
                            dataSource={invitedMembers}
                            renderItem={(member) => (
                              <List.Item>
                                <List.Item.Meta
                                  avatar={
                                    <Avatar src={member.member.avatar_path}>
                                      {!member.member.avatar_path &&
                                        member.member.full_name
                                          ?.charAt(0)
                                          .toUpperCase()}
                                    </Avatar>
                                  }
                                  title={
                                    member.member.full_name ||
                                    member.phone ||
                                    "Không có tên"
                                  }
                                  description={
                                    <span>
                                      Đã mời vào{" "}
                                      {new Date(
                                        member.joined_at
                                      ).toLocaleString()}
                                      {member.status === "pending" &&
                                        " - Đang chờ chấp nhận"}
                                      {member.status === "approved" &&
                                        " - Đã chấp nhận"}
                                      {member.status === "" && " - Đã từ chối"}
                                    </span>
                                  }
                                />
                              </List.Item>
                            )}
                          />
                        ) : (
                          <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="Bạn chưa mời ai vào nhóm này"
                          />
                        )}
                      </>
                    ),
                  },
                ]}
              />
            </Modal>
            {/* Modal chọn thành viên để chuyển quyền admin */}
            <Modal
              title="Chuyển quyền nhóm trưởng"
              open={showTransferAdminChooserModal}
              onCancel={() => setShowTransferAdminChooserModal(false)}
              footer={[
                <Button
                  key="cancel"
                  onClick={() => setShowTransferAdminChooserModal(false)}
                >
                  Huỷ
                </Button>,
                <Button
                  key="transfer"
                  type="primary"
                  onClick={handleTransferAdmin}
                  disabled={!newAdminIdForTransfer}
                >
                  Chuyển quyền
                </Button>,
              ]}
              width={500}
            >
              <Alert
                message="Lưu ý quan trọng"
                description="Sau khi chuyển quyền, người được chọn sẽ trở thành nhóm trưởng và bạn sẽ trở thành thành viên thường."
                type="info"
                style={{ marginBottom: "15px" }}
                showIcon
              />

              <p>Chọn một thành viên để trở thành nhóm trưởng mới:</p>

              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {groupMembers
                  // Lọc ra các thành viên khác, ưu tiên hiển thị nhóm phó trước
                  .filter((member) => member.user_id !== user.id)
                  .sort((a, b) => {
                    // Sắp xếp để nhóm phó hiển thị đầu tiên
                    if (a.role === "admin" && b.role !== "admin") return -1;
                    if (a.role !== "admin" && b.role === "admin") return 1;
                    return 0;
                  })
                  .map((member) => (
                    <div
                      key={member.user_id}
                      onClick={() => setNewAdminIdForTransfer(member.user_id)}
                      style={{
                        display: "flex",
                        padding: "10px",
                        alignItems: "center",
                        borderBottom: "1px solid #f0f0f0",
                        cursor: "pointer",
                        backgroundColor:
                          newAdminIdForTransfer === member.user_id
                            ? "#e6f7ff"
                            : "white",
                      }}
                    >
                      <Checkbox
                        checked={newAdminIdForTransfer === member.user_id}
                        onChange={() =>
                          setNewAdminIdForTransfer(member.user_id)
                        }
                      />
                      <Avatar
                        src={member.avatar_path}
                        style={{ marginLeft: 10, marginRight: 10 }}
                      >
                        {!member.avatar_path &&
                          (member.full_name || "User").charAt(0).toUpperCase()}
                      </Avatar>
                      <div>
                        <div>{member.full_name}</div>
                        {member.role === "admin" && (
                          <div style={{ fontSize: "12px", color: "#52c41a" }}>
                            Nhóm phó
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </Modal>

            {/* Hiển thị thành viên nhóm nếu là chat nhóm */}
            {selectedChat.chat_type === "group" && (
              <div className="group-members-wrapper">
                <div
                  className="select-wrapper"
                  onClick={() => setIsOpenMembers(!isOpenMembers)}
                >
                  <h3>Thành viên nhóm ({groupMembers.length})</h3>
                  {isOpenMembers ? (
                    <FaCaretDown className="anticon" />
                  ) : (
                    <FaCaretRight className="anticon" />
                  )}
                </div>
                {isOpenMembers && (
                  <div className="modal-members-list">
                    <div className="members-list">
                      {groupMembers
                        .slice(0, showAllMembers ? groupMembers.length : 5)
                        .map((member) => (
                          <div key={member.user_id} className="member-item">
                            <Avatar
                              src={member.avatar_path}
                              style={{ cursor: "pointer" }}
                              onClick={() => handleMemberClick(member)}
                            >
                              {!member.avatar_path &&
                                (member.full_name || "User")
                                  .charAt(0)
                                  .toUpperCase()}
                            </Avatar>
                            <div className="member-details">
                              <span className="member-name">
                                {member.full_name}
                              </span>

                              {member.user_id === selectedChat.admin_id && (
                                <span
                                  className="admin-badge"
                                  style={{ marginLeft: 5 }}
                                >
                                  (Nhóm trưởng)
                                </span>
                              )}
                              {member.role === "admin" &&
                                member.user_id !== selectedChat.admin_id && (
                                  <span
                                    className="admin-badge"
                                    style={{ marginLeft: 5 }}
                                  >
                                    (Nhóm phó)
                                  </span>
                                )}
                            </div>
                          </div>
                        ))}
                    </div>
                    {groupMembers.length > 5 && !showAllMembers && (
                      <Button
                        type="link"
                        className="show-all-btn"
                        onClick={() => setShowAllMembers(true)}
                      >
                        Xem tất cả {groupMembers.length} thành viên
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
            {/* Modal thông tin thành viên */}
            <Modal
              title="Thông tin thành viên"
              open={showMemberInfoModal}
              onCancel={() => setShowMemberInfoModal(false)}
              footer={null}
              width={400}
            >
              {selectedMember && (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <Avatar
                    size={100}
                    src={selectedMember.avatar_path}
                    style={{ marginBottom: 15 }}
                  >
                    {!selectedMember.avatar_path &&
                      (selectedMember.full_name || "User")
                        .charAt(0)
                        .toUpperCase()}
                  </Avatar>

                  <h2 style={{ margin: "15px 0", fontWeight: 600 }}>
                    {selectedMember.full_name}
                    {selectedMember.user_id === selectedChat.admin_id && (
                      <span
                        style={{
                          fontSize: "14px",
                          color: "#1890ff",
                          marginLeft: 8,
                        }}
                      >
                        (Nhóm trưởng)
                      </span>
                    )}
                    {selectedMember.role === "admin" &&
                      selectedMember.user_id !== selectedChat.admin_id && (
                        <span
                          style={{
                            fontSize: "14px",
                            color: "#52c41a",
                            marginLeft: 8,
                          }}
                        >
                          (Nhóm phó)
                        </span>
                      )}
                  </h2>

                  {selectedMember.phone && (
                    <p style={{ margin: "8px 0", color: "#666" }}>
                      <PhoneOutlined style={{ marginRight: 8 }} />{" "}
                      {selectedMember.phone}
                    </p>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: 25,
                      gap: 15,
                    }}
                  >
                    {/* Nếu thành viên là user hiện tại thì không hiển thị nút kết bạn/nhắn tin */}
                    {selectedMember.user_id !== user.id &&
                      (isCheckingFriend ? (
                        <Spin size="small" />
                      ) : isFriend ? (
                        <Button
                          type="primary"
                          icon={<MessageOutlined />}
                          onClick={handleMessageMember}
                        >
                          Nhắn tin
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          icon={<UserAddOutlined />}
                          onClick={handleSendFriendRequest}
                        >
                          Kết bạn
                        </Button>
                      ))}
                  </div>
                </div>
              )}
            </Modal>
            {/* Nhóm chung - chỉ hiển thị nếu là chat 1-1 */}
            {selectedChat.chat_type !== "group" && (
              <div
                style={{
                  marginTop: "0px",
                  backgroundColor: "#ffffff",
                  marginBottom: "20px",
                  boxShadow: "1px 1px 5px 1px #ddd",
                  padding: "10px",
                  display: "flex",
                  paddingLeft: "20px",
                  gap: "10px",
                }}
              >
                <MdOutlineGroup
                  className="icon-group"
                  style={{ fontSize: "20px" }}
                />
                <h3 style={{ fontWeight: "400", color: "gray" }}>
                  {" "}
                  4 Nhóm chung
                </h3>
              </div>
            )}

            {/* Hình ảnh/Video section */}
            <div className="conversation-options">
              <div
                className="select-wrapper"
                onClick={() => setIsOpenMedia(!isOpenMedia)}
              >
                <h3>Hình ảnh/Video</h3>
                {isOpenMedia ? (
                  <FaCaretDown className="anticon" />
                ) : (
                  <FaCaretRight className="anticon" />
                )}
              </div>
              {isOpenMedia && (
                <div className="modal-media-gallery">
                  {mediaItems.length > 0 ? (
                    <>
                      <div className="media-gallery">
                        {visibleMedia.map((item) =>
                          item.type === "image" ? (
                            <img
                              key={item.id}
                              src={item.url}
                              alt="media"
                              className="media-item"
                              onClick={() => {
                                setSelectedImageIndex(
                                  mediaItems.findIndex(
                                    (media) => media.id === item.id
                                  )
                                );
                                setShowImageViewerModal(true);
                              }}
                              style={{ cursor: "pointer" }}
                            />
                          ) : (
                            <video
                              key={item.id}
                              controls
                              className="media-item"
                              onClick={() => {
                                setSelectedImageIndex(
                                  mediaItems.findIndex(
                                    (media) => media.id === item.id
                                  )
                                );
                                setShowImageViewerModal(true);
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              <source src={item.url} type="video/mp4" />
                              Trình duyệt không hỗ trợ video.
                            </video>
                          )
                        )}
                      </div>
                      {mediaItems.length > 8 && !showAll && (
                        <button
                          className="show-all-btn"
                          onClick={() => setShowAll(true)}
                        >
                          Xem tất cả
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="no-content-message">
                      Chưa có hình ảnh hoặc video nào
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Modal xem ảnh chi tiết */}
            <Modal
              open={showImageViewerModal}
              onCancel={() => setShowImageViewerModal(false)}
              footer={null}
              width={1000}
              className="image-viewer-modal"
              centered
            >
              <div
                className="image-viewer-container"
                style={{ display: "flex", height: "80vh" }}
              >
                {/* Phần trung tâm hiển thị ảnh lớn */}
                <div
                  className="main-image-container"
                  style={{
                    flex: "3",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      maxHeight: "80vh",
                      textAlign: "center",
                    }}
                  >
                    {mediaItems[selectedImageIndex]?.type === "image" ? (
                      <img
                        src={mediaItems[selectedImageIndex]?.url}
                        alt="Selected media"
                        style={{
                          maxHeight: "70vh",
                          maxWidth: "100%",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <video
                        controls
                        style={{ maxHeight: "70vh", maxWidth: "100%" }}
                      >
                        <source
                          src={mediaItems[selectedImageIndex]?.url}
                          type="video/mp4"
                        />
                        Trình duyệt không hỗ trợ video.
                      </video>
                    )}

                    {/* Button tải xuống */}
                    <div style={{ marginTop: "15px" }}>
                      <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={() =>
                          window.open(
                            mediaItems[selectedImageIndex]?.url,
                            "_blank"
                          )
                        }
                      >
                        Tải xuống
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Danh sách ảnh thu nhỏ bên phải */}
                <div
                  className="thumbnail-list"
                  style={{
                    flex: "1",
                    overflowY: "auto",
                    padding: "0 10px",
                    borderLeft: "1px solid #eee",
                  }}
                >
                  {mediaItems.map((item, index) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedImageIndex(index)}
                      style={{
                        padding: "5px",
                        cursor: "pointer",
                        border:
                          selectedImageIndex === index
                            ? "2px solid #1890ff"
                            : "2px solid transparent",
                        marginBottom: "10px",
                        borderRadius: "4px",
                      }}
                    >
                      {item.type === "image" ? (
                        <img
                          src={item.url}
                          alt={`Thumbnail ${index}`}
                          style={{
                            width: "100%",
                            height: "80px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            position: "relative",
                            width: "100%",
                            height: "80px",
                          }}
                        >
                          <video
                            style={{
                              width: "100%",
                              height: "80px",
                              objectFit: "cover",
                            }}
                          >
                            <source src={item.url} type="video/mp4" />
                          </video>
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "rgba(0,0,0,0.5)",
                            }}
                          >
                            <PlayCircleOutlined
                              style={{ fontSize: "24px", color: "white" }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Modal>

            {/* File section */}
            <div className="file-section">
              <div
                className="select-wrapper"
                onClick={() => setIsOpenFile(!isOpenFile)}
              >
                <h3>File</h3>
                {isOpenFile ? (
                  <FaCaretDown className="anticon" />
                ) : (
                  <FaCaretRight className="anticon" />
                )}
              </div>
              {isOpenFile && (
                <div className="modal-file-list">
                  {processedFileItems.length > 0 ? (
                    <>
                      <div className="file-list-wrapper">
                        {processedFileItems.slice(0, 5).map((file) => (
                          <div className="file-item" key={file.id}>
                            <div
                              className="file-info-wrapper"
                              onClick={() => setShowAllFiles(!showAllFiles)}
                            >
                              {file.type === "pdf" ? (
                                <BiSolidFilePdf
                                  className="type-icon"
                                  style={{ color: "red" }}
                                />
                              ) : ["zip", "rar", "7z"].includes(file.type) ? (
                                <AiFillFileZip
                                  className="type-icon"
                                  style={{ color: "violet" }}
                                />
                              ) : ["doc", "docx"].includes(file.type) ? (
                                <FaFileWord
                                  className="type-icon"
                                  style={{ color: "blue" }}
                                />
                              ) : ["xls", "xlsx"].includes(file.type) ? (
                                <FaFileExcel
                                  className="type-icon"
                                  style={{ color: "green" }}
                                />
                              ) : ["ppt", "pptx"].includes(file.type) ? (
                                <FaFilePowerpoint
                                  className="type-icon"
                                  style={{ color: "orange" }}
                                />
                              ) : (
                                <FaFileAlt
                                  className="type-icon"
                                  style={{ color: "gray" }}
                                />
                              )}
                              <div className="file-info">
                                <h4
                                  style={{
                                    width: "180px",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    marginBottom: "2px",
                                  }}
                                >
                                  {file.name}
                                </h4>
                                <p>{file.size}</p>
                              </div>
                            </div>
                            <div className="file-date-wrapper">
                              <p>{file.date}</p>
                              <Button
                                type="text"
                                icon={<DownloadOutlined />}
                                size="small"
                                onClick={() => window.open(file.url, "_blank")}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      {processedFileItems.length > 5 && (
                        <div style={{ padding: "0 20px" }}>
                          <button
                            className="icon-showallFile"
                            onClick={() => setShowAllFiles(true)}
                          >
                            Xem tất cả
                          </button>
                        </div>
                      )}
                    </>
                  ) : fileItems.length > 0 ? (
                    <div className="loading-files">
                      <div>Đang tải thông tin file...</div>
                    </div>
                  ) : (
                    <div className="no-content-message">
                      Chưa có tệp nào được gửi
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Modal xem tất cả file */}
            {showAllFiles && (
              <Modal
                title="Tất cả file đã gửi"
                open={showAllFiles}
                onCancel={() => setShowAllFiles(false)}
                footer={null}
                width={700}
              >
                <Input
                  placeholder="Tìm kiếm file..."
                  prefix={<SearchOutlined />}
                  style={{ marginBottom: 15 }}
                  onChange={(e) => {
                    // Có thể thêm logic tìm kiếm file ở đây
                  }}
                />

                <div
                  className="all-files-list"
                  style={{ maxHeight: "60vh", overflowY: "auto" }}
                >
                  {processedFileItems.map((file) => (
                    <div
                      className="file-item"
                      key={file.id}
                      style={{
                        borderBottom: "1px solid #f0f0f0",
                        padding: "10px 0",
                      }}
                    >
                      <div className="file-info-wrapper">
                        {/* Icon type code */}
                        <div className="file-info">
                          <h4
                            style={{
                              maxWidth: "400px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              marginBottom: "2px",
                            }}
                          >
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {file.name}
                            </a>
                          </h4>
                          <div
                            style={{
                              display: "flex",
                              gap: "20px",
                              color: "#888",
                            }}
                          >
                            <span>{file.size}</span>
                            <span>{file.date}</span>
                            <span>
                              Gửi bởi:{" "}
                              {file.msg.sender_name || "Không xác định"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={() => window.open(file.url, "_blank")}
                      >
                        Tải về
                      </Button>
                    </div>
                  ))}
                </div>
              </Modal>
            )}

            {/* Link section */}
            <div className="modal-link-section">
              <div
                className="select-wrapper"
                onClick={() => setIsOpenLink(!isOpenLink)}
              >
                <h3>Link</h3>
                {isOpenLink ? (
                  <FaCaretDown className="anticon" />
                ) : (
                  <FaCaretRight className="anticon" />
                )}
              </div>
              {isOpenLink && (
                <div className="modal-link-list">
                  {linkItems.length > 0 ? (
                    <>
                      <div className="link-list-wrapper">
                        {linkItems.slice(0, 5).map((link) => (
                          <div className="link-item" key={link.id}>
                            <div className="link-info-wrapper">
                              <CiLink className="type-icon-link" />
                              <div className="link-info">
                                <p>{link.title}</p>
                                <h4>
                                  <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {link.url.length > 30
                                      ? link.url.substring(0, 30) + "..."
                                      : link.url}
                                  </a>
                                </h4>
                              </div>
                            </div>
                            <div className="date-getlink">
                              <p>{link.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {linkItems.length > 5 && (
                        <div style={{ padding: "0 20px" }}>
                          <button className="icon-showallLink">
                            Xem tất cả
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="no-content-message">
                      Chưa có liên kết nào được chia sẻ
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer với các button khác nhau tùy vào loại chat */}
            <div className="footer">
              <button
                onClick={() => setShowDeleteHistoryModal(true)}
                className="danger-button"
              >
                <DeleteOutlined /> Xóa lịch sử trò chuyện
              </button>
              {selectedChat.chat_type === "group" && (
                <button
                  onClick={() => setShowLeaveGroupModal(true)}
                  className="danger-button leave-group"
                >
                  <LogoutOutlined /> Rời nhóm
                </button>
              )}
              {/* Modal chia sẻ lời mời nhóm */}
              {selectedChat.chat_type === "group" && (
                <GroupInviteModal
                  visible={showInviteModal}
                  onCancel={() => setShowInviteModal(false)}
                  groupId={selectedChat.id}
                  userId={user.id}
                  groupName={selectedChat.name}
                />
              )}
              {/* Modal chọn admin mới khi admin chính muốn rời nhóm */}
              <Modal
                title="Chọn admin mới trước khi rời nhóm"
                open={showTransferAdminModal}
                onCancel={() => setShowTransferAdminModal(false)}
                footer={[
                  <Button
                    key="cancel"
                    onClick={() => setShowTransferAdminModal(false)}
                  >
                    Huỷ
                  </Button>,
                  <Button
                    key="transfer"
                    type="primary"
                    onClick={handleTransferAdminAndLeave}
                    disabled={!newAdminId}
                  >
                    Chuyển quyền và rời nhóm
                  </Button>,
                ]}
                width={500}
              >
                <Alert
                  message="Bạn là admin chính của nhóm này!"
                  description="Bạn cần chọn một thành viên khác làm admin trước khi rời nhóm."
                  type="warning"
                  style={{ marginBottom: "15px" }}
                  showIcon
                />

                <p>Chọn một thành viên để trở thành admin mới:</p>

                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {groupMembers
                    // Lọc ra các thành viên khác, ưu tiên hiển thị nhóm phó trước
                    .filter((member) => member.user_id !== user.id)
                    .sort((a, b) => {
                      // Sắp xếp để nhóm phó hiển thị đầu tiên
                      if (a.role === "admin" && b.role !== "admin") return -1;
                      if (a.role !== "admin" && b.role === "admin") return 1;
                      return 0;
                    })
                    .map((member) => (
                      <div
                        key={member.user_id}
                        onClick={() => setNewAdminId(member.user_id)}
                        style={{
                          display: "flex",
                          padding: "10px",
                          alignItems: "center",
                          borderBottom: "1px solid #f0f0f0",
                          cursor: "pointer",
                          backgroundColor:
                            newAdminId === member.user_id ? "#e6f7ff" : "white",
                        }}
                      >
                        <Checkbox
                          checked={newAdminId === member.user_id}
                          onChange={() => setNewAdminId(member.user_id)}
                        />
                        <Avatar
                          src={member.avatar_path}
                          style={{ marginLeft: 10, marginRight: 10 }}
                        >
                          {!member.avatar_path &&
                            (member.full_name || "User")
                              .charAt(0)
                              .toUpperCase()}
                        </Avatar>
                        <div>
                          <div>{member.full_name}</div>
                          {member.role === "admin" && (
                            <div style={{ fontSize: "12px", color: "#52c41a" }}>
                              Nhóm phó
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </Modal>
            </div>
          </div>
        )}

        {activeTab === "icons" && (
          <div className="chat-icons">
            <div className="picker-container-ConversationDetails">
              <div className="tabs-conversationDetails">
                <button
                  className={activeTabForEmojiGif === "emoji" ? "active" : ""}
                  onClick={() => setActiveTabForEmojiGif("emoji")}
                >
                  Emoji
                </button>
                <button
                  className={activeTabForEmojiGif === "gif" ? "active" : ""}
                  onClick={() => setActiveTabForEmojiGif("gif")}
                >
                  GIF
                </button>
              </div>
              <div className="picker-content-conversationDetails">
                {activeTabForEmojiGif === "emoji" ? (
                  <Picker
                    onEmojiClick={onEmojiClick}
                    className="emoji-picker-"
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : (
                  <GifPicker
                    onSelect={(gifUrl) => {
                      setSelectedGif(gifUrl);
                      handleGifSelect(gifUrl);
                    }}
                    onImageUpload={() => {}}
                    style={{ width: "100%" }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal đặt biệt danh */}
      {showModalSetNickName && (
        <div className="modal-overlay">
          <div className="modal-set-nickname">
            <div className="modal-set-nickname-header">
              <h3>Đặt tên gợi nhớ</h3>
            </div>
            <div className="modal-set-nickname-body">
              <img src={selectedChat.avatar_path} alt="" />
              <p>
                Hãy đặt tên cho <strong>{selectedChat.name} </strong>
                một tên dễ nhớ.
              </p>
              <p>Tên gợi nhớ chỉ hiển thị với bạn.</p>
              <input
                ref={inputRef}
                type="text"
                placeholder="Nhập tên gợi nhớ"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>
            <div className="modal-set-nickname-footer">
              <button onClick={() => setShowModalSetNickName(false)}>
                Hủy
              </button>
              <button onClick={handleSaveNickname}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận rời nhóm */}
      <Modal
        title={
          <span>
            <ExclamationCircleOutlined style={{ color: "red" }} /> Xác nhận rời
            nhóm
          </span>
        }
        open={showLeaveGroupModal}
        onCancel={() => setShowLeaveGroupModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowLeaveGroupModal(false)}>
            Hủy
          </Button>,
          <Button key="leave" type="primary" danger onClick={handleLeaveGroup}>
            Rời nhóm
          </Button>,
        ]}
      >
        <p>Bạn có chắc chắn muốn rời khỏi nhóm "{selectedChat.name}"?</p>
        {isMainAdmin && (
          <Alert
            message="Lưu ý quan trọng"
            description="Bạn là admin chính của nhóm này. Bạn cần chỉ định một admin mới trước khi rời nhóm."
            type="warning"
            showIcon
            style={{ marginTop: "10px", marginBottom: "10px" }}
          />
        )}
        <p>Bạn sẽ không thể nhận tin nhắn từ nhóm này nữa.</p>
      </Modal>

      {/* Modal xác nhận xóa lịch sử */}
      <Modal
        title={
          <span>
            <ExclamationCircleOutlined style={{ color: "red" }} /> Xóa lịch sử
            trò chuyện
          </span>
        }
        open={showDeleteHistoryModal}
        onCancel={() => setShowDeleteHistoryModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowDeleteHistoryModal(false)}>
            Hủy
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            onClick={handleDeleteHistory}
          >
            Xóa lịch sử
          </Button>,
        ]}
      >
        <p>
          Bạn có chắc chắn muốn xóa lịch sử trò chuyện với "{selectedChat.name}
          "?
        </p>
        <p>Hành động này không thể hoàn tác.</p>
      </Modal>
      {/* Modal tạo nhóm mới */}
      <Modal
        title="Tạo nhóm trò chuyện mới"
        open={showCreateGroupModal}
        onCancel={() => setShowCreateGroupModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowCreateGroupModal(false)}>
            Hủy
          </Button>,
          <Button
            key="create"
            type="primary"
            onClick={handleCreateGroup}
            disabled={
              !newGroupName.trim() || selectedFriendsForGroup.length < 2
            }
          >
            Tạo nhóm
          </Button>,
        ]}
        width={550}
      >
        <div style={{ marginBottom: 20 }}>
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 20 }}
          >
            <div style={{ marginRight: 20, position: "relative" }}>
              <Avatar
                size={64}
                src={newGroupAvatarPreview}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  document.getElementById("new-group-avatar").click()
                }
              >
                {!newGroupAvatarPreview &&
                  (newGroupName ? newGroupName[0].toUpperCase() : "G")}
              </Avatar>
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  background: "#1890ff",
                  borderRadius: "50%",
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                onClick={() =>
                  document.getElementById("new-group-avatar").click()
                }
              >
                <CameraOutlined style={{ color: "white", fontSize: 12 }} />
              </div>
              <input
                type="file"
                id="new-group-avatar"
                hidden
                accept="image/*"
                onChange={handleGroupAvatarChange}
              />
            </div>
            <Input
              placeholder="Nhập tên nhóm..."
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>

          <Divider orientation="left">Thêm thành viên</Divider>

          <div style={{ marginBottom: 15 }}>
            <Input
              placeholder="Tìm kiếm bạn bè..."
              prefix={<SearchOutlined />}
              value={searchFriendTerm}
              onChange={(e) => setSearchFriendTerm(e.target.value)}
            />
          </div>

          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {isLoadingFriends ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                Đang tải danh sách bạn bè...
              </div>
            ) : (
              <>
                {/* Hiển thị người nhận hiện tại (receiver) đã được chọn */}
                {selectedChat && selectedChat.id !== user.id && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "10px",
                      borderBottom: "1px solid #f0f0f0",
                      background: "#f6f6f6",
                    }}
                  >
                    <Checkbox
                      checked={selectedFriendsForGroup.includes(
                        selectedChat.id
                      )}
                      onChange={() =>
                        handleSelectFriendForGroup(selectedChat.id)
                      }
                    />
                    <Avatar
                      src={selectedChat.avatar_path}
                      style={{ marginLeft: 10, marginRight: 10 }}
                    >
                      {!selectedChat.avatar_path &&
                        (selectedChat.name || "U").charAt(0).toUpperCase()}
                    </Avatar>
                    <span>{selectedChat.name} (Đang trò chuyện)</span>
                  </div>
                )}

                {/* Danh sách bạn bè */}
                {friendsList
                  .filter(
                    (friend) =>
                      friend.id !== selectedChat.id && // Loại trừ receiver đã hiển thị ở trên
                      (friend.full_name
                        ?.toLowerCase()
                        .includes(searchFriendTerm.toLowerCase()) ||
                        friend.name
                          ?.toLowerCase()
                          .includes(searchFriendTerm.toLowerCase()))
                  )
                  .map((friend) => (
                    <div
                      key={friend.id || friend._id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "10px",
                        borderBottom: "1px solid #f0f0f0",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        handleSelectFriendForGroup(friend.id || friend._id)
                      }
                    >
                      <Checkbox
                        checked={selectedFriendsForGroup.includes(
                          friend.id || friend._id
                        )}
                        onChange={() => {}} // Handled by parent div click
                      />
                      <Avatar
                        src={friend.avatar_path}
                        style={{ marginLeft: 10, marginRight: 10 }}
                      >
                        {!friend.avatar_path &&
                          (friend.full_name || friend.name || "U")
                            .charAt(0)
                            .toUpperCase()}
                      </Avatar>
                      <span>{friend.full_name || friend.name}</span>
                    </div>
                  ))}

                {friendsList.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px 0",
                      color: "#999",
                    }}
                  >
                    Không tìm thấy bạn bè nào
                  </div>
                )}
              </>
            )}
          </div>

          <div style={{ marginTop: 15 }}>
            <Alert
              message="Lưu ý"
              description="Nhóm cần có ít nhất 3 thành viên (bạn, người trò chuyện hiện tại và ít nhất 1 bạn bè khác)."
              type="info"
              showIcon
            />
          </div>

          {selectedFriendsForGroup.length > 0 && (
            <div style={{ marginTop: 15 }}>
              <div style={{ marginBottom: 5 }}>
                Đã chọn ({selectedFriendsForGroup.length + 1} thành viên):
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                <span
                  style={{
                    padding: "2px 8px",
                    background: "#e6f7ff",
                    borderRadius: 4,
                    border: "1px solid #91d5ff",
                  }}
                >
                  Bạn (Nhóm trưởng)
                </span>
                {selectedFriendsForGroup.map((friendId) => {
                  const friend = [...friendsList, selectedChat].find(
                    (f) => (f.id || f._id) === friendId
                  );
                  return friend ? (
                    <span
                      key={friendId}
                      style={{
                        padding: "2px 8px",
                        background: "#e6f7ff",
                        borderRadius: 4,
                        border: "1px solid #91d5ff",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      {friend.name || friend.full_name}
                      <CloseOutlined
                        style={{ cursor: "pointer", fontSize: 10 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectFriendForGroup(friendId);
                        }}
                      />
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ConversationDetails;
