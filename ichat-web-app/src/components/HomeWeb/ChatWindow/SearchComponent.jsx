import React, { useState, useEffect } from "react";
import { Input, Button, List, Avatar, Modal, Card, Divider, message } from "antd";
import { SearchOutlined, CloseOutlined, UserAddOutlined, MessageOutlined } from "@ant-design/icons";
import "./SearchComponent.css";
import {searchUsersByPhone} from "../../../redux/slices/userSlide";
import { useDispatch, useSelector } from "react-redux";

const SearchComponent = ({ searchText, setSearchText, onClose, onSelectUser }) => {
  const dispatch = useDispatch();
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  
  const handleClear = () => {
    setSearchText("");
    setSearchResults([]);
  };

  // Function to normalize phone number format
  const normalizePhoneNumber = (phone) => {
    // Remove all non-digit characters
    let digits = phone.replace(/\D/g, '');
    
    // If it starts with '0', replace with '+84'
    if (digits.startsWith('0')) {
      digits = '84' + digits.substring(1);
    }
    
    // If it doesn't have the country code, add it
    if (!digits.startsWith('84')) {
      digits = '84' + digits;
    }
    
    return '+' + digits;
  };

  const handleSearch = async () => {
    if (searchText.trim()) {
      setIsSearching(true);
      try {
        let query = searchText.trim();
        let searchType = 'name';
        
        // Check if input is a phone number (starts with 0 or +)
        const isPhoneNumber = /^[0+]\d{8,}$/.test(query);
        
        if (isPhoneNumber) {
          // Normalize the phone number format
          query = normalizePhoneNumber(query);
          searchType = 'phone';
          console.log("Searching for phone number:", query);
        }
        
        // Dispatch an action to search users by name or exact phone
        const response = await dispatch(searchUsersByPhone({
          query: query,
          searchType: searchType,
          exactMatch: searchType === 'phone' // Use exact match for phone numbers
        })).unwrap();
        
        // If no results and was a phone search, try alternative format
        if (response.length === 0 && searchType === 'phone') {
          // Try without the + sign if it had one
          const altQuery = query.startsWith('+') ? query.substring(1) : '+' + query;
          console.log("Trying alternative phone format:", altQuery);
          
          const altResponse = await dispatch(searchUsersByPhone({
            query: altQuery,
            searchType: 'phone',
            exactMatch: true
          })).unwrap();
          
          setSearchResults(altResponse);
        } else {
          setSearchResults(response);
        }
        
        if (searchType === 'phone' && response.length === 0) {
          message.info("Không tìm thấy người dùng với số điện thoại này");
        }
      } catch (error) {
        console.error("Search failed:", error);
        message.error("Không thể thực hiện tìm kiếm. Vui lòng thử lại sau.");
      } finally {
        setIsSearching(false);
      }
    }
  };

  // Format phone number for display
  const formatPhoneDisplay = (phone) => {
    if (!phone) return "Không có số điện thoại";
    
    // If starts with +84, format for display
    if (phone.startsWith('+84')) {
      return '0' + phone.substring(3);
    }
    return phone;
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
    // Pass the user to parent component for chat
    if (onSelectUser) {
      const chatUser = {
        id: user.id,
        name: user.full_name,
        avatar_path: user.avatar_path,
        phone: user.phone,
        receiver_id: user.id  // Important for chat functionality
      };
      onSelectUser(chatUser);
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
          placeholder="Tìm kiếm bằng tên hoặc số điện thoại..."
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
              <Button 
                type="primary" 
                icon={<UserAddOutlined />}
                onClick={() => handleSendFriendRequest(selectedProfile.id)}
                className="action-button"
              >
                Gửi lời mời kết bạn
              </Button>
              
              <Button 
                icon={<MessageOutlined />}
                onClick={() => handleStartChat(selectedProfile)}
                className="action-button"
              >
                Nhắn tin
              </Button>
            </div>
          </Card>
        </Modal>
      )}
    </div>
  );
};

export default SearchComponent;