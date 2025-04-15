import React from "react";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "antd";
import "./ConversationDetails.css";
import { FaCaretDown } from "react-icons/fa";
import { FaCaretRight } from "react-icons/fa";
import { BiSolidFilePdf } from "react-icons/bi";
import { AiFillFileZip } from "react-icons/ai";
import { FaFileWord } from "react-icons/fa";
import { CiLink } from "react-icons/ci";
import { MdOutlineGroup } from "react-icons/md";
import {
  EditOutlined,
  BellOutlined,
  PushpinOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { GrContract } from "react-icons/gr";
import MessageArea from "./MessageArea";
import GifPicker from "./GifPicker";
import Picker from "emoji-picker-react";

const ConversationDetails = ({
  isVisible,
  selectedChat,
  handleExpandContract,
  isExpanded,
  activeTabFromMessageArea,
  handleSendMessage, // Thêm prop mới
  onImageUpload, // Thêm prop mới
  setInputMessage,
}) => {
  //Gọi hook cấp cao nhất để lấy giá trị của input
  const inputRef = useRef(null);
  // Tabs
  const [activeTab, setActiveTab] = useState("info");
  useEffect(() => {
    if (!isExpanded) setActiveTab(activeTabFromMessageArea);
  });

  const [nickname, setNickname] = useState(selectedChat.name || "");
  // Chọn toàn bộ văn bản khi input được render để chỉnh sửa
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.select(); // Chọn toàn bộ văn bản khi input được render
    }
  }, []);
  // hiển thị modal đặt biệt danh
  const [showModalSetNickName, setShowModalSetNickName] = useState(false);
  const handleShowModalSetNickName = () => {
    setShowModalSetNickName(!showModalSetNickName);
  };

  // Hiển thị ảnh vide,file,link
  const [isOpenMedia, setIsOpenMedia] = useState(true);
  const [isOpenFile, setIsOpenFile] = useState(false);
  const [isOpenLink, setIsOpenLink] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const fakeMedia = [
    {
      id: 1,
      type: "image",
      url: "https://i.ibb.co/n783RKQ/pexels-xmtnguyen-699953.jpg",
    },
    {
      id: 2,
      type: "image",
      url: "https://i.ibb.co/n783RKQ/pexels-xmtnguyen-699953.jpg",
    },
    { id: 3, type: "video", url: "https://www.w3schools.com/html/mov_bbb.mp4" },
    {
      id: 4,
      type: "image",
      url: "https://i.ibb.co/n783RKQ/pexels-xmtnguyen-699953.jpg",
    },
    { id: 5, type: "video", url: "https://www.w3schools.com/html/mov_bbb.mp4" },
    {
      id: 6,
      type: "image",
      url: "https://i.ibb.co/n783RKQ/pexels-xmtnguyen-699953.jpg",
    },
    {
      id: 7,
      type: "image",
      url: "https://i.ibb.co/n783RKQ/pexels-xmtnguyen-699953.jpg",
    },
    { id: 8, type: "video", url: "https://www.w3schools.com/html/mov_bbb.mp4" },
  ];
  // Expand Contract
  const handleExpandContractWrapper = () => {
    console.log("handleExpandContract called");
    handleExpandContract(); // Gọi hàm từ props
  };
  // Gif và emoji
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [selectedGif, setSelectedGif] = useState(null);
  const [activeTabForEmojiGif, setActiveTabForEmojiGif] = useState("emoji");

  //Dư liệu file giả
  const fileList = [
    {
      id: 1,
      name: "Document.pdf",
      size: "1.2MB",
      date: "04/03/2025",
      type: "pdf",
      color: "red",
    },
    {
      id: 2,
      name: "Archive.rar",
      size: "3.8MB",
      date: "05/03/2025",
      type: "rar",
      color: "purple",
    },
    {
      id: 3,
      name: "Report.docx",
      size: "2.5MB",
      date: "06/03/2025",
      type: "docx",
      color: "blue",
    },
  ];

  const visibleMedia = showAll ? fakeMedia : fakeMedia.slice(0, 8);
  // Add this function in your ConversationDetails component
  const handleGifSelect = async (gifUrl) => {
    try {
      // First, fetch the GIF data
      const response = await fetch(gifUrl);
      const gifBlob = await response.blob();

      // Create a File object from the blob
      const gifFile = new File([gifBlob], `gif_${Date.now()}.gif`, {
        type: "image/gif",
      });

      // Use the existing onImageUpload function
      onImageUpload(gifFile);

      // Optionally close the picker
      if (isExpanded) {
        setActiveTab("info"); // Switch back to info tab
      }
    } catch (error) {
      console.error("Error processing GIF:", error);
    }
  };
  //  Click emoji set vào input
  const onEmojiClick = (event) => {
    const emoji = event.emoji; // Lấy emoji từ thuộc tính `emoji` của event
    if (emoji) {
      setInputMessage((prevMessage) => prevMessage + emoji); // Thêm emoji vào tin nhắn
    } else {
      console.error("Emoji is undefined or invalid:", event); // Log lỗi nếu emoji không hợp lệ
    }
  };
  console.log("Selected from coversationDetails:", selectedChat);
  if (!isVisible) return null; // Ẩn component nếu isVisible = fals và Chỉ return sau khi đã gọi hết các Hook

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
                <Avatar size={60} src={`${selectedChat.avatar_path}`} />
              </div>
              <h3>
                {selectedChat.name}
                <EditOutlined
                  className="icon-edit"
                  onClick={handleShowModalSetNickName}
                />
              </h3>
            </div>

            <div className="action-buttons">
              <div className="notification-layout">
                <button className="action-button">
                  <BellOutlined className="icon-notification" />
                </button>
                <span>
                  Tắt <br /> thông báo
                </span>
              </div>
              <div>
                <button className="action-button">
                  <PushpinOutlined />
                </button>
                <span>
                  Ghim <br /> hộp thoại
                </span>
              </div>
              <div>
                <button className="action-button">
                  <UsergroupAddOutlined />
                </button>
                <span>
                  Tạo nhóm <br /> trò chuyện
                </span>
              </div>
            </div>
            {/* Nhóm chung */}
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
                  <div className="media-gallery">
                    {visibleMedia.map((item) =>
                      item.type === "image" ? (
                        <img
                          key={item.id}
                          src={item.url}
                          alt="media"
                          className="media-item"
                        />
                      ) : (
                        <video key={item.id} controls className="media-item">
                          <source src={item.url} type="video/mp4" />
                          Trình duyệt không hỗ trợ video.
                        </video>
                      )
                    )}
                  </div>

                  <button
                    className="show-all-btn"
                    onClick={() => setShowAll(true)}
                  >
                    Xem tất cả
                  </button>
                </div>
              )}
            </div>
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
                  <div className="file-list-wrapper">
                    {fileList.map((file) => (
                      <div className="file-item" key={file.id}>
                        <div className="file-info-wrapper">
                          {/* <BiSolidFilePdf
                        className="type-icon"
                        style={{ color: "red" }}
                      /> */}
                          {file.type === "pdf" ? (
                            <BiSolidFilePdf
                              className="type-icon"
                              style={{ color: "red" }}
                            />
                          ) : file.type === "rar" ? (
                            <AiFillFileZip
                              className="type-icon"
                              style={{ color: "violet" }}
                            />
                          ) : (
                            <FaFileWord
                              className="type-icon"
                              style={{ color: "blue" }}
                            />
                          )}
                          <div className="file-info">
                            <h4>{file.name}</h4>
                            <p>{file.size}</p>
                          </div>
                        </div>
                        <div className="file-date-wrapper">
                          <p>{file.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: "0 20px" }}>
                    <button className="icon-showallFile">Xem tất cả</button>
                  </div>
                </div>
              )}
            </div>
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
                  <div className="link-list-wrapper">
                    <div className="link-item">
                      <div className="link-info-wrapper">
                        <CiLink className="type-icon-link" />
                        <div className="link-info">
                          <p>Google</p>
                          <h4>https://www.google.com</h4>
                        </div>
                      </div>
                      <div className="date-getlink">
                        <p>20/2/2025</p>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: "0 20px" }}>
                    <button className="icon-showallLink">Xem tất cả</button>
                  </div>
                </div>
              )}
            </div>
            <div className="footer">
              <button>Xóa lịch sử trò chuyện</button>
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
                    // onEmojiClick={onEmojiClick}
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
                    onImageUpload={() => {}} // Empty function to prevent error
                    style={{ width: "100%" }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {showModalSetNickName && (
        <div className="modal-overlay">
          <div className="modal-set-nickname">
            <div className="modal-set-nickname-header">
              <h3>Đặt tên gợi nhớ</h3>
            </div>
            <div className="modal-set-nickname-body">
              <img src={`${selectedChat.avatar_path}`} alt="" />
              <p>
                Hãy đặt tên cho <strong>{selectedChat.name} </strong>
                một tên dễ nhớ.
              </p>
              <p>Tên gợi nhớ chỉ hiển thị với bạn.</p>
              <input
                ref={inputRef}
                type="text"
                placeholder="Nhập tên gợi nhớ"
                // value={selectedChat.name}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)} // Cho phép sửa giá trị

                // có thể thay đổi giá trị của selectedChat.name
              />
            </div>
            <div className="modal-set-nickname-footer">
              <button onClick={() => setShowModalSetNickName(false)}>
                Hủy
              </button>
              <button>Xác nhận</button>
            </div>
          </div>
        </div>
      )}
      <MessageArea handleExpandContract={handleExpandContract} />
    </div>
  );
};

export default ConversationDetails;
