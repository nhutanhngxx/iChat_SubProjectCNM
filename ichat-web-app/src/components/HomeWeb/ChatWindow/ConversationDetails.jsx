import React from "react";
import { useEffect, useRef, useState } from "react";
import { Avatar, Button, message, Modal,Alert} from "antd"; // Thêm message, Modal
import "./ConversationDetails.css";
import { FaCaretDown } from "react-icons/fa";
import { FaCaretRight } from "react-icons/fa";
import { BiSolidFilePdf } from "react-icons/bi";
import { AiFillFileZip } from "react-icons/ai";
import { FaFileWord, FaFilePowerpoint, FaFileExcel, FaFileAlt } from "react-icons/fa";
import { CiLink } from "react-icons/ci";
import { MdOutlineGroup } from "react-icons/md";
import { 
    Divider, 
    Input, 
    Select,
    Checkbox,
  } from 'antd';
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
  CloseOutlined
} from "@ant-design/icons";
import { DownloadOutlined,PlayCircleOutlined } from '@ant-design/icons';
import { 
    UserAddOutlined, 
    SettingOutlined,
    UploadOutlined,
    SearchOutlined
  } from "@ant-design/icons";
  import { CameraOutlined } from "@ant-design/icons";
import { createGroup } from "../../../redux/slices/groupSlice";
import { getUserFriends } from "../../../redux/slices/friendSlice";

 
import { GrContract } from "react-icons/gr";
import GifPicker from "./GifPicker";
import Picker from "emoji-picker-react";
import { useDispatch } from "react-redux";
import axios from "axios";

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
  user
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
    setSelectedFriendsForGroup(selectedFriendsForGroup.filter(id => id !== friendId));
  } else {
    setSelectedFriendsForGroup([...selectedFriendsForGroup, friendId]);
  }
};

// Handler tạo nhóm
const handleCreateGroup = async () => {
  if (!newGroupName.trim()) {
    return message.error("Vui lòng nhập tên nhóm");
  }
  
  if (selectedFriendsForGroup.length < 1) {
    return message.error("Vui lòng chọn ít nhất 1 người bạn khác");
  }
  
  try {
    message.loading({ content: "Đang tạo nhóm...", key: "createGroup" });
    
    // Tạo nhóm mới với danh sách thành viên bao gồm user hiện tại và các bạn bè đã chọn
    const newGroup = await dispatch(createGroup({
      name: newGroupName,
      admin_id: user.id, // Người tạo nhóm là admin
      avatar: newGroupAvatar, // File avatar đã chọn (có thể null)
      participant_ids: selectedFriendsForGroup // Danh sách ID những người đã chọn
    })).unwrap();
    
    message.success({
      content: "Tạo nhóm thành công!",
      key: "createGroup"
    });
    
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
      key: "createGroup"
    });
    console.error("Error creating group:", error);
  }
};
  // Thêm hàm formatBytes ở đầu component
const formatBytes = (bytes, decimals = 2) => {
  if (!bytes) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Thay đổi cách xử lý fileItems
const fileItems = React.useMemo(() => {
  if (!allMessages) return [];
  
  const items = allMessages
    .filter(msg => msg.type === "file")
    .map(msg => {
      const fileUrl = msg.content;
      const fileName = decodeURIComponent(fileUrl.split("/").pop());
      const parts = fileName.split("-");
      const originalName = parts.length > 2 ? parts.slice(2).join("-") : fileName;
      const fileExt = originalName.split('.').pop().toLowerCase();
      
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
        msg: msg,  // Store the full message for accessing later
        size: "Đang lấy kích thước..." // Placeholder, will be updated after fetch
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
        .filter(msg => msg.type === "image" || msg.type === "video")
        .map(msg => ({
          id: msg._id,
          type: msg.type,
          url: msg.content,
          timestamp: msg.timestamp
        }))
    : [];

  // const fileItems = allMessages
  //   ? allMessages
  //       .filter(msg => msg.type === "file")
  //       .map(msg => {
  //         // Extract file name and extension from URL
  //         const fileName = msg.content.split('/').pop();
  //         const fileExt = fileName.split('.').pop().toLowerCase();
          
  //         // Determine file type and color
  //         let type = fileExt;
  //         let color = "gray";
          
  //         if (fileExt === "pdf") color = "red";
  //         else if (["zip", "rar", "7z"].includes(fileExt)) color = "purple";
  //         else if (["doc", "docx"].includes(fileExt)) color = "blue";
  //         else if (["xls", "xlsx"].includes(fileExt)) color = "green";
  //         else if (["ppt", "pptx"].includes(fileExt)) color = "orange";
          
  //         return {
  //           id: msg._id,
  //           name: fileName,
  //           size: "Unknown", // We could fetch this info from the file if needed
  //           date: new Date(msg.timestamp).toLocaleDateString(),
  //           type: type,
  //           color: color,
  //           url: msg.content
  //         };
  //       })
  //   : [];

  const linkItems = allMessages
    ? allMessages
        .filter(msg => 
          msg.type === "text" && 
          msg.content && 
          msg.content.match(/https?:\/\/[^\s]+/g)
        )
        .flatMap(msg => {
          const links = msg.content.match(/https?:\/\/[^\s]+/g) || [];
          return links.map((link, index) => ({
            id: `${msg._id}-${index}`,
            url: link,
            title: getDomainFromUrl(link),
            date: new Date(msg.timestamp).toLocaleDateString()
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
      const response = await axios.get(`http://${window.location.hostname}:5001/api/friendships/${user.id}`);
      console.log("Friends response:", response.data.friends);
      
      if (response.data && response.data.friends) {
        // Lọc ra bạn bè chưa có trong nhóm
        const existingMemberIds = groupMembers.map(member => member.user_id);
        const availableFriends = response.data.friends.filter(
          friend => !existingMemberIds.includes(friend.id || friend._id)
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
    }
  }, [selectedChat]);

  // Function to fetch group members
  const fetchGroupMembers = async () => {
    try {
      // Modify this to use your actual API endpoint
      const response = await axios.get(`http://${window.location.hostname}:5001/api/groups/${selectedChat.id}/members`);
        console.log("Group members response:", response);
        
      if (response.data && Array.isArray(response.data.data)) {
        setGroupMembers(response.data.data);
        
        // Check if current user is admin
        const currentUser = response.data.data.find(member => 
          member.user_id === user.id || member.user_id === user._id
        );
        
        setIsAdmin(currentUser?.role === "admin");
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

  const handleLeaveGroup = async () => {
    try {
      // Implementation for leaving group
      // await axios.post(...);
      message.success("Đã rời nhóm thành công");
      setShowLeaveGroupModal(false);
    } catch (error) {
      message.error("Không thể rời nhóm. Vui lòng thử lại.");
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
  console.log("Group members:", groupMembers);
  console.log("Selected chat:", selectedChat);
  
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
                  {!selectedChat.avatar_path && (selectedChat.name || 'User').charAt(0).toUpperCase()}
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
                        onClick={() => setShowAddMembersModal(true)}
                        >
                        <UserAddOutlined />
                        </button>
                        <span style={{width:"74px"}}>
                        Thêm thành viên
                        </span>
                    </div>
                    <div>
                        <button 
                        className="conversation-action-button"
                        onClick={() => setShowGroupSettingsModal(true)}
                        >
                        <SettingOutlined />
                        </button>
                        <span>
                        Quản lý<br />nhóm
                        </span>
                    </div>
                    </>
                ) : (
                    <div>
                    <button className="conversation-action-button"  onClick={handleCreateGroupClick}>
                        <UsergroupAddOutlined />
                    </button>
                    <span>
                        Tạo nhóm <br /> trò chuyện
                    </span>
                    </div>
                )}
                </div>
                            {/* Modal thêm thành viên */}
                <Modal
                title="Thêm thành viên vào nhóm"
                open={showAddMembersModal}
                onCancel={() => setShowAddMembersModal(false)}
                footer={[
                    <Button key="cancel" onClick={() => setShowAddMembersModal(false)}>
                    Hủy
                    </Button>,
                    <Button 
                    key="add" 
                    type="primary" 
                    disabled={selectedMembers.length === 0}
                    onClick={() => {
                        // Xử lý thêm thành viên vào nhóm
                        message.success(`Đã thêm ${selectedMembers.length} thành viên vào nhóm`);
                        setShowAddMembersModal(false);
                        setSelectedMembers([]);
                    }}
                    >
                    Thêm ({selectedMembers.length})
                    </Button>
                ]}
                width={500}
                >
                <Input
                    placeholder="Tìm kiếm bạn bè..."
                    prefix={<SearchOutlined />}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ marginBottom: 15 }}
                />
                
                <div className="friends-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {friends
                    .filter(friend => 
                        friend.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        friend.name?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map(friend => (
                        <div key={friend.id || friend._id} className="friend-item" style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px',
                        borderBottom: '1px solid #f0f0f0'
                        }}>
                        <Checkbox
                            checked={selectedMembers.includes(friend.id || friend._id)}
                            onChange={e => {
                            if (e.target.checked) {
                                setSelectedMembers([...selectedMembers, friend.id || friend._id]);
                            } else {
                                setSelectedMembers(selectedMembers.filter(id => id !== (friend.id || friend._id)));
                            }
                            }}
                        />
                        <Avatar 
                            src={friend.avatar_path} 
                            style={{ marginLeft: 10, marginRight: 10 }}
                        >
                            {(friend.full_name || friend.name || 'User').charAt(0).toUpperCase()}
                        </Avatar>
                        <span>{friend.full_name || friend.name}</span>
                        </div>
                    ))
                    }
                    {friends.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
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
                    <Button key="cancel" onClick={() => setShowGroupSettingsModal(false)}>
                    Hủy
                    </Button>,
                    <Button 
                    key="save" 
                    type="primary" 
                    onClick={() => {
                        // Xử lý lưu cài đặt nhóm
                        message.success("Đã cập nhật thông tin nhóm");
                        setShowGroupSettingsModal(false);
                    }}
                    >
                    Lưu thay đổi
                    </Button>
                ]}
                width={500}
                >
                <div style={{ marginBottom: 20 }}>
                    <h4>Thông tin cơ bản</h4>
                    <div style={{ display: 'flex', marginBottom: 15, alignItems: 'center' }}>
                    <div style={{ marginRight: 15 }}>
                        <Avatar 
                        size={64} 
                        src={selectedChat.avatar_path}
                        style={{ cursor: 'pointer' }}
                        onClick={() => document.getElementById('group-avatar-upload').click()}
                        >
                        {!selectedChat.avatar_path && (selectedChat.name || 'G').charAt(0).toUpperCase()}
                        </Avatar>
                        <input
                        type="file"
                        id="group-avatar-upload"
                        hidden
                        accept="image/*"
                        onChange={(e) => {
                            if (e.target.files[0]) {
                            setGroupAvatar(e.target.files[0]);
                            }
                        }}
                        />
                        <div style={{ textAlign: 'center', marginTop: 5 }}>
                        <Button type="text" icon={<UploadOutlined />} size="small">
                            Đổi ảnh
                        </Button>
                        </div>
                    </div>
                    <Input
                        placeholder="Tên nhóm"
                        value={groupName}
                        onChange={e => setGroupName(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    </div>
                </div>

                <Divider />

                <div style={{ marginBottom: 20 }}>
                    <h4>Cài đặt thành viên</h4>
                    <div style={{ marginBottom: 10 }}>
                    <Checkbox 
                        checked={requireApproval}
                        onChange={e => setRequireApproval(e.target.checked)}
                    >
                        Yêu cầu phê duyệt khi có thành viên mới muốn tham gia
                    </Checkbox>
                    </div>
                    
                    <div style={{ marginBottom: 10 }}>
                    <Checkbox>
                        Cho phép tất cả thành viên thêm người mới
                    </Checkbox>
                    </div>
                    
                    <div style={{ marginBottom: 10 }}>
                    <Checkbox>
                        Cho phép thành viên thay đổi tên và ảnh nhóm
                    </Checkbox>
                    </div>
                </div>

                <Divider />

                <div style={{ marginBottom: 20 }}>
                    <h4>Quản lý vai trò</h4>
                    <div className="admin-section">
                    {groupMembers.slice(0, 5).map(member => (
                        <div key={member.user_id} className="member-item" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 0',
                        borderBottom: '1px solid #f0f0f0'
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar src={member.avatar_path} style={{ marginRight: 10 }}>
                            {!member.avatar_path && (member.full_name || 'User').charAt(0).toUpperCase()}
                            </Avatar>
                            <span>{member.full_name}</span>
                        </div>
                        
                        <Select
                            defaultValue={member.role || "member"}
                            style={{ width: 120 }}
                            disabled={
                            member.user_id === user.id || 
                            member.user_id === user._id || 
                            !isAdmin
                            }
                            onChange={(value) => {
                            // Xử lý thay đổi vai trò
                            console.log(`Changed ${member.full_name}'s role to ${value}`);
                            }}
                        >
                            <Select.Option value="admin">Nhóm trưởng</Select.Option>
                            <Select.Option value="member">Thành viên</Select.Option>
                        </Select>
                        </div>
                    ))}
                    
                    {groupMembers.length > 5 && (
                        <Button type="link" style={{ padding: '10px 0' }}>
                        Xem tất cả thành viên
                        </Button>
                    )}
                    </div>
                </div>

                {isAdmin && (
                    <>
                    <Divider />
                    <div>
                        <Button danger onClick={() => {
                        Modal.confirm({
                            title: 'Xác nhận giải tán nhóm',
                            content: 'Bạn có chắc chắn muốn giải tán nhóm này? Hành động này không thể hoàn tác.',
                            okText: 'Giải tán',
                            okType: 'danger',
                            cancelText: 'Hủy',
                            onOk() {
                            message.success('Đã giải tán nhóm thành công');
                            setShowGroupSettingsModal(false);
                            },
                        });
                        }}>
                        <DeleteOutlined /> Giải tán nhóm
                        </Button>
                    </div>
                    </>
                )}
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
                      {groupMembers.slice(0, showAllMembers ? groupMembers.length : 5).map(member => (
                        <div key={member.user_id} className="member-item">
                          <Avatar src={member.avatar_path}>
                            {!member.avatar_path && (member.full_name || 'User').charAt(0).toUpperCase()}
                          </Avatar>
                          <div className="member-details">
                            <span className="member-name">{member.full_name}</span>
                            {member.role === "admin" && <span className="admin-badge">Nhóm trưởng</span>}
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
                                setSelectedImageIndex(mediaItems.findIndex(media => media.id === item.id));
                                setShowImageViewerModal(true);
                              }}
                            style={{ cursor: "pointer" }}
                            />
                          ) : (
                            <video key={item.id} controls className="media-item" onClick={() => {
                              setSelectedImageIndex(mediaItems.findIndex(media => media.id === item.id));
                              setShowImageViewerModal(true);
                            }}
                            style={{ cursor: 'pointer' }}>
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
                <div className="image-viewer-container" style={{ display: 'flex', height: '80vh' }}>
                  {/* Phần trung tâm hiển thị ảnh lớn */}
                  <div className="main-image-container" style={{ flex: '3', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ position: 'relative', maxHeight: '80vh', textAlign: 'center' }}>
                      {mediaItems[selectedImageIndex]?.type === "image" ? (
                        <img 
                          src={mediaItems[selectedImageIndex]?.url} 
                          alt="Selected media" 
                          style={{ maxHeight: '70vh', maxWidth: '100%', objectFit: 'contain' }} 
                        />
                      ) : (
                        <video controls style={{ maxHeight: '70vh', maxWidth: '100%' }}>
                          <source src={mediaItems[selectedImageIndex]?.url} type="video/mp4" />
                          Trình duyệt không hỗ trợ video.
                        </video>
                      )}
                      
                      {/* Button tải xuống */}
                      <div style={{ marginTop: '15px' }}>
                        <Button 
                          type="primary" 
                          icon={<DownloadOutlined />} 
                          onClick={() => window.open(mediaItems[selectedImageIndex]?.url, '_blank')}
                        >
                          Tải xuống
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Danh sách ảnh thu nhỏ bên phải */}
                  <div className="thumbnail-list" style={{ flex: '1', overflowY: 'auto', padding: '0 10px', borderLeft: '1px solid #eee' }}>
                    {mediaItems.map((item, index) => (
                      <div 
                        key={item.id} 
                        onClick={() => setSelectedImageIndex(index)}
                        style={{ 
                          padding: '5px', 
                          cursor: 'pointer', 
                          border: selectedImageIndex === index ? '2px solid #1890ff' : '2px solid transparent',
                          marginBottom: '10px',
                          borderRadius: '4px'
                        }}
                      >
                        {item.type === "image" ? (
                          <img 
                            src={item.url} 
                            alt={`Thumbnail ${index}`} 
                            style={{ width: '100%', height: '80px', objectFit: 'cover' }} 
                          />
                        ) : (
                          <div style={{ position: 'relative', width: '100%', height: '80px' }}>
                            <video style={{ width: '100%', height: '80px', objectFit: 'cover' }}>
                              <source src={item.url} type="video/mp4" />
                            </video>
                            <div style={{ 
                              position: 'absolute', 
                              top: 0, 
                              left: 0, 
                              right: 0, 
                              bottom: 0, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              background: 'rgba(0,0,0,0.5)' 
                            }}>
                              <PlayCircleOutlined style={{ fontSize: '24px', color: 'white' }} />
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
                            <div className="file-info-wrapper" onClick={()=>setShowAllFiles(!showAllFiles)}>
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
                                <h4>{file.name}</h4>
                                <p>{file.size}</p>
                              </div>
                            </div>
                            <div className="file-date-wrapper">
                              <p>{file.date}</p>
                              <Button 
                                type="text"
                                icon={<DownloadOutlined />} 
                                size="small"
                                onClick={() => window.open(file.url, '_blank')}
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
              {
                showAllFiles && (
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
                
                <div className="all-files-list" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                  {processedFileItems.map((file) => (
                    <div className="file-item" key={file.id} style={{ borderBottom: '1px solid #f0f0f0', padding: '10px 0' }}>
                      <div className="file-info-wrapper">
                        {file.type === "pdf" ? (
                          <BiSolidFilePdf className="type-icon" style={{ color: "red", fontSize: '24px' }} />
                        ) : ["zip", "rar", "7z"].includes(file.type) ? (
                          <AiFillFileZip className="type-icon" style={{ color: "violet", fontSize: '24px' }} />
                        ) : ["doc", "docx"].includes(file.type) ? (
                          <FaFileWord className="type-icon" style={{ color: "blue", fontSize: '24px' }} />
                        ) : ["xls", "xlsx"].includes(file.type) ? (
                          <FaFileExcel className="type-icon" style={{ color: "green", fontSize: '24px' }} />
                        ) : ["ppt", "pptx"].includes(file.type) ? (
                          <FaFilePowerpoint className="type-icon" style={{ color: "orange", fontSize: '24px' }} />
                        ) : (
                          <FaFileAlt className="type-icon" style={{ color: "gray", fontSize: '24px' }} />
                        )}
                        <div className="file-info">
                          <h4>
                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                              {file.name}
                            </a>
                          </h4>
                          <div style={{ display: 'flex', gap: '20px', color: '#888' }}>
                            <span>{file.size}</span>
                            <span>{file.date}</span>
                            <span>Gửi bởi: {file.msg.sender_name || 'Không xác định'}</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        Tải về
                      </Button>
                    </div>
                  ))}
                </div>
              </Modal>
                )
              }

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
                        {linkItems.slice(0, 5).map(link => (
                          <div className="link-item" key={link.id}>
                            <div className="link-info-wrapper">
                              <CiLink className="type-icon-link" />
                              <div className="link-info">
                                <p>{link.title}</p>
                                <h4>
                                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                                    {link.url.length > 30 ? link.url.substring(0, 30) + "..." : link.url}
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
                          <button className="icon-showallLink">Xem tất cả</button>
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
        title={<span><ExclamationCircleOutlined style={{ color: 'red' }} /> Xác nhận rời nhóm</span>}
        open={showLeaveGroupModal}
        onCancel={() => setShowLeaveGroupModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowLeaveGroupModal(false)}>
            Hủy
          </Button>,
          <Button key="leave" type="primary" danger onClick={handleLeaveGroup}>
            Rời nhóm
          </Button>
        ]}
      >
        <p>Bạn có chắc chắn muốn rời khỏi nhóm "{selectedChat.name}"?</p>
        <p>Bạn sẽ không thể nhận tin nhắn từ nhóm này nữa.</p>
      </Modal>

      {/* Modal xác nhận xóa lịch sử */}
      <Modal
        title={<span><ExclamationCircleOutlined style={{ color: 'red' }} /> Xóa lịch sử trò chuyện</span>}
        open={showDeleteHistoryModal}
        onCancel={() => setShowDeleteHistoryModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowDeleteHistoryModal(false)}>
            Hủy
          </Button>,
          <Button key="delete" type="primary" danger onClick={handleDeleteHistory}>
            Xóa lịch sử
          </Button>
        ]}
      >
        <p>Bạn có chắc chắn muốn xóa lịch sử trò chuyện với "{selectedChat.name}"?</p>
        <p>Hành động này không thể hoàn tác.</p>
      </Modal>
      // Thêm đoạn code này vào cuối component, trước dòng return cuối cùng

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
              disabled={!newGroupName.trim() || selectedFriendsForGroup.length < 1}
            >
              Tạo nhóm
            </Button>
          ]}
          width={550}
        >
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ marginRight: 20, position: 'relative' }}>
                <Avatar 
                  size={64} 
                  src={newGroupAvatarPreview}
                  style={{ cursor: 'pointer' }}
                  onClick={() => document.getElementById('new-group-avatar').click()}
                >
                  {!newGroupAvatarPreview && (newGroupName ? newGroupName[0].toUpperCase() : 'G')}
                </Avatar>
                <div 
                  style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    right: 0, 
                    background: '#1890ff', 
                    borderRadius: '50%',
                    width: 20, 
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer' 
                  }}
                  onClick={() => document.getElementById('new-group-avatar').click()}
                >
                  <CameraOutlined style={{ color: 'white', fontSize: 12 }} />
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
                onChange={e => setSearchFriendTerm(e.target.value)}
              />
            </div>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {isLoadingFriends ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>Đang tải danh sách bạn bè...</div>
              ) : (
                <>
                  {/* Hiển thị người nhận hiện tại (receiver) đã được chọn */}
                  {selectedChat && selectedChat.id !== user.id && (
                    <div 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        padding: '10px', 
                        borderBottom: '1px solid #f0f0f0',
                        background: '#f6f6f6'
                      }}
                    >
                      <Checkbox 
                        checked={selectedFriendsForGroup.includes(selectedChat.id)}
                        onChange={() => handleSelectFriendForGroup(selectedChat.id)}
                      />
                      <Avatar 
                        src={selectedChat.avatar_path} 
                        style={{ marginLeft: 10, marginRight: 10 }}
                      >
                        {!selectedChat.avatar_path && (selectedChat.name || 'U').charAt(0).toUpperCase()}
                      </Avatar>
                      <span>{selectedChat.name} (Đang trò chuyện)</span>
                    </div>
                  )}
                  
                  {/* Danh sách bạn bè */}
                  {friendsList
                    .filter(friend => 
                      friend.id !== selectedChat.id && // Loại trừ receiver đã hiển thị ở trên
                      (friend.full_name?.toLowerCase().includes(searchFriendTerm.toLowerCase()) || 
                      friend.name?.toLowerCase().includes(searchFriendTerm.toLowerCase()))
                    )
                    .map(friend => (
                      <div 
                        key={friend.id || friend._id} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          padding: '10px', 
                          borderBottom: '1px solid #f0f0f0',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleSelectFriendForGroup(friend.id || friend._id)}
                      >
                        <Checkbox 
                          checked={selectedFriendsForGroup.includes(friend.id || friend._id)}
                          onChange={() => {}} // Handled by parent div click
                        />
                        <Avatar 
                          src={friend.avatar_path} 
                          style={{ marginLeft: 10, marginRight: 10 }}
                        >
                          {!friend.avatar_path && (friend.full_name || friend.name || 'U').charAt(0).toUpperCase()}
                        </Avatar>
                        <span>{friend.full_name || friend.name}</span>
                      </div>
                    ))
                  }
                  
                  {friendsList.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
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
                <div style={{ marginBottom: 5 }}>Đã chọn ({selectedFriendsForGroup.length + 1} thành viên):</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  <span style={{ 
                    padding: '2px 8px', 
                    background: '#e6f7ff', 
                    borderRadius: 4,
                    border: '1px solid #91d5ff'
                  }}>
                    Bạn (Nhóm trưởng)
                  </span>
                  {selectedFriendsForGroup.map(friendId => {
                    const friend = [...friendsList, selectedChat].find(f => (f.id || f._id) === friendId);
                    return friend ? (
                      <span 
                        key={friendId} 
                        style={{ 
                          padding: '2px 8px', 
                          background: '#e6f7ff', 
                          borderRadius: 4,
                          border: '1px solid #91d5ff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5
                        }}
                      >
                        {friend.name || friend.full_name}
                        <CloseOutlined 
                          style={{ cursor: 'pointer', fontSize: 10 }} 
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