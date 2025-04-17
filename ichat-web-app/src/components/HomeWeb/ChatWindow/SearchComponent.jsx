import React, { useState, useEffect } from "react";
import { Input, Button, List, Avatar, Modal, Card, Divider, message } from "antd";
import { SearchOutlined, CloseOutlined, UserAddOutlined, MessageOutlined } from "@ant-design/icons";
import "./SearchComponent.css";
import {searchUsersPhone,searchUsersByPhone} from "../../../redux/slices/userSlide";
import { fetchChatMessages } from "../../../redux/slices/messagesSlice";
import { getUserFriends } from "../../../redux/slices/friendSlice";
import { useDispatch, useSelector } from "react-redux";
import { AsYouType } from 'libphonenumber-js';
import { parsePhoneNumberFromString } from 'libphonenumber-js';


const SearchComponent = ({ searchText, setSearchText, onClose, onSelectUser,user }) => {
  const dispatch = useDispatch();
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const [friends, setFriends] = useState([]);
  // Lấy danh sách bạn bè
  useEffect(() => {
  const fetchFriends = async () => {
    try {
      const result = await dispatch(getUserFriends(user._id || user.id)).unwrap();
      setFriends(result);
      console.log("friends from Search component", user._id || user.id, result);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách bạn bè:", err);
    }
  };

  if (user._id || user.id) {
    fetchFriends();
  }
}, [dispatch, user._id, user.id]);

  console.log("friends from Search component",user._id||user.id,friends);
  // Kiêm tra xem người dùng đã là bạn hay chưa
  const isFriend = (userId) => {
    return friends.friends.some(friend => friend.id === userId);
  };
  const handleClear = () => {
    setSearchText("");
    setSearchResults([]);
  };
// Khi bấm nhắn tin sẽ chuyển sang trang chat
  const handleChat =async (user) => {
    setSelectedProfile(user);
    setProfileModalVisible(false); // Đóng modal
    const chatUser = {
      id: user.id,
      name: user.full_name,
      avatar_path: user.avatar_path,
      phone: user.phone,
      receiver_id: user.id  // Important for chat functionality
    };
    onSelectUser(chatUser); // Truyền người dùng đã chọn cho component cha

  }
  // Function to normalize phone number format
  const normalizePhoneNumber = (phone) => {
    try {
      const phoneNumber = parsePhoneNumberFromString(phone, 'VN'); // 'VN' là mã quốc gia Việt Nam
      if (phoneNumber && phoneNumber.isValid()) {
        return phoneNumber.number; // Trả về dạng E.164, ví dụ: +84912345678
      } else {
        return null;
      }
    } catch (error) {
      console.error('Lỗi parse số điện thoại:', error);
      return null;
    }
  };

  // const handleSearch = async () => {
  //   if (searchText.trim()) {
  //     setIsSearching(true);
  //     try {
  //       let query = searchText.trim();
  //       let searchType = 'name';
        
  //       // Check if input is a phone number (starts with 0 or +)
  //       const isPhoneNumber = /^[0+]\d{8,}$/.test(query);
        
  //       if (isPhoneNumber) {
  //         // Normalize the phone number format
  //         query = normalizePhoneNumber(query);
  //         searchType = 'phone';
  //         console.log("Searching for phone number:", query);
  //       }
        
  //       // Dispatch an action to search users by name or exact phone
  //       const response = await dispatch(searchUsersByPhone({
  //         query: query,
  //         searchType: searchType,
  //         exactMatch: searchType === 'phone' // Use exact match for phone numbers
  //       })).unwrap();
        
  //       // If no results and was a phone search, try alternative format
  //       if (response.length === 0 && searchType === 'phone') {
  //         // Try without the + sign if it had one
  //         const altQuery = query.startsWith('+') ? query.substring(1) : '+' + query;
  //         console.log("Trying alternative phone format:", altQuery);
          
  //         const altResponse = await dispatch(searchUsersByPhone({
  //           query: altQuery,
  //           searchType: 'phone',
  //           exactMatch: true
  //         })).unwrap();
          
  //         setSearchResults(altResponse);
  //       } else {
  //         setSearchResults(response);
  //       }
        
  //       if (searchType === 'phone' && response.length === 0) {
  //         message.info("Không tìm thấy người dùng với số điện thoại này");
  //       }
  //     } catch (error) {
  //       console.error("Search failed:", error);
  //       message.error("Không thể thực hiện tìm kiếm. Vui lòng thử lại sau.");
  //     } finally {
  //       setIsSearching(false);
  //     }
  //   }
  // };

  // Format phone number for display
  const handleSearch = async () => {
    if (!searchText.trim()) return;
  
    setIsSearching(true);
  
    // Chuẩn hóa số điện thoại
    const normalizedPhone = normalizePhoneNumber(searchText.trim());
    
    if (!normalizedPhone) {
      // message.warning("Vui lòng nhập số điện thoại hợp lệ");
      setIsSearching(false);
      return;
    }

  
    try {
      // Dùng action mới
      console.log("Searching for phone number:", normalizedPhone);
      const response = await dispatch(searchUsersByPhone(normalizedPhone)).unwrap();
  
      if (response.length === 0) {
        message.info("Không tìm thấy người dùng với số điện thoại này");
      }
  
      setSearchResults(response);
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
      message.error("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsSearching(false);
    }
  };
  
  
  
  const formatPhoneDisplay = (phone) => {
    // if (!phone) return "Không có số điện thoại";
    
    // // If starts with +84, format for display
    // if (phone.startsWith('+84')) {
    //   return '0' + phone.substring(3);
    // }
    // return phone;
    if (!phone) return "Không có số điện thoại";
    return new AsYouType('VN').input(phone);
  };

  // Search when user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  const handleUserClick = (user) => {
    setSelectedProfile(user);
    setProfileModalVisible(true);
  };

  const handleSendFriendRequest = async (userId) => {
    try {
      // Dispatch action to send friend request
      // await dispatch(sendFriendRequest(userId)).unwrap();
      console.log("Friend request sent to:", userId);
      message.success("Đã gửi lời mời kết bạn");
    } catch (error) {
      console.error("Failed to send friend request:", error);
      message.error("Không thể gửi lời mời kết bạn. Vui lòng thử lại.");
    }
  };

  const handleStartChat = (user) => {
    // Close the modal
    setProfileModalVisible(false);
    // // Pass the user to parent component for chat
    // if (onSelectUser) {
    //   const chatUser = {
    //     id: user.id,
    //     name: user.full_name,
    //     avatar_path: user.avatar_path,
    //     phone: user.phone,
    //     receiver_id: user.id  // Important for chat functionality
    //   };
    //   onSelectUser(chatUser);
    // }
    if (onSelectUser) {
      // Format the user object to match what handleSelectUser in ChatWindow expects
      const normalizedUser = {
        id: user.id,
        name: user.full_name || user.name,
        lastMessage: "",
        time: new Date(),
        unread: 0,
        user_status: user.user_status || "Offline",
        type: "text",
        avatar_path: user.avatar_path || "https://default-avatar.com/avatar.jpg",
        priority: "",
        isLastMessageFromMe: false,
        receiver_id: user.id  // This is very important
      };
      
      console.log("Starting chat with user:", normalizedUser);
      onSelectUser(normalizedUser);
    }
    // Close the search panel
    onClose();
  };

  return (
    <div className="search-component">
      <div className="search-container">
        <Input
          prefix={<SearchOutlined className="search-icon" />}
          suffix={
            searchText && (
              <CloseOutlined className="clear-icon" onClick={handleClear} />
            )
          }
          className="search-bar"
          placeholder="Tìm kiếm số điện thoại..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={handleSearch}
        />
        <Button type="text" className="close" onClick={onClose}>
          <p style={{ margin: 0 }}>Đóng</p>
        </Button>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="search-results">
          <List
            loading={isSearching}
            dataSource={searchResults}
            renderItem={(user) => (
              <List.Item 
                onClick={() => handleUserClick(user)}
                className="search-result-item"
              >
                <List.Item.Meta
                  avatar={<Avatar src={user.avatar_path || "https://via.placeholder.com/40"} />}
                  title={user.full_name}
                  description={formatPhoneDisplay(user.phone)}
                />
              </List.Item>
            )}
          />
        </div>
      )}

      {/* Profile Modal */}
      {selectedProfile && (
        <Modal
          open={profileModalVisible}
          onCancel={() => setProfileModalVisible(false)}
          footer={null}
          className="user-profile-modal"
          style={{background:"none"}}
        >
          <Card bordered={false} className="profile-card">
            <div className="profile-header">
              <Avatar 
                size={80} 
                src={selectedProfile.avatar_path || "https://via.placeholder.com/80"} 
                className="profile-avatar"
              />
              <h2 className="profile-name">{selectedProfile.full_name}</h2>
              <p className="profile-phone">{formatPhoneDisplay(selectedProfile.phone)}</p>
            </div>
            
            <Divider />
            
            <div className="profile-actions">
            {!isFriend(selectedProfile.id) && (
                <>
                <Button onClick={() => handleSendFriendRequest(selectedProfile.id)}>
                  Gửi lời mời kết bạn
                </Button>
                <Button 
                icon={<MessageOutlined />}
                onClick={() => handleStartChat(selectedProfile)}
                className="action-button"
              >
                Nhắn tin
              </Button>
                </>
                
              )}
              {isFriend(selectedProfile.id) && (
                <Button 
                icon={<MessageOutlined />}
                onClick={() => handleStartChat(selectedProfile)}
                className="action-button hover:bg-blue-500"
                style={{height:"40px",width:"100%"}}
              >
                Nhắn tin  
              </Button>
              )}
              
            </div>
          </Card>
        </Modal>
      )}
    </div>
  );
};

export default SearchComponent;