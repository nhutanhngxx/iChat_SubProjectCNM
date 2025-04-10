import React, { useState } from "react";
import "./css/PrivacySettings.css";
import { FiChevronRight } from "react-icons/fi";
import { Switch, Select, Checkbox } from "antd";
import { FaChevronLeft } from "react-icons/fa";
const { Option } = Select;

const PrivacySettings = () => {
  const [showBirthday, setShowBirthday] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showSeenStatus, setShowSeenStatus] = useState(true);
  const [allowMessaging, setAllowMessaging] = useState("all");
  const [allowCalls, setAllowCalls] = useState("friendsAndContacts");
  const [allowStrangerSearch, setAllowStrangerSearch] = useState(true);
  const [allowStrangerFriendRequest, setAllowStrangerFriendRequest] =
    useState(true);
  const [friendRequestOptions, setFriendRequestOptions] = useState({
    qrCode: false,
    commonGroups: true,
    zaloCard: false,
    suggestedFriends: false,
  });

  const handleFriendRequestOptionChange = (option) => {
    setFriendRequestOptions({
      ...friendRequestOptions,
      [option]: !friendRequestOptions[option],
    });
  };
  // Mở danh sách chặn
  const [showBlockList, setShowBlockList] = useState(false);
  const handleBlockListClick = () => {
    setShowBlockList(true);
  };
  const handleBackClick = () => {
    setShowBlockList(false);
  };
  return (
    <div className="privacy-settings">
      <div className={`main-content ${showBlockList ? "shift-left" : ""}`}>
        <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>Cá nhân</h2>
        <div className="setting-item">
          <p>Hiện ngày sinh</p>
          <Switch checked={showBirthday} onChange={(e) => setShowBirthday(e)} />
        </div>
        <div className="setting-item">
          <p>Hiển thị trạng thái truy cập</p>
          <Switch
            checked={showOnlineStatus}
            onChange={(e) => setShowOnlineStatus(e)}
          />
        </div>

        <h2>Tin nhắn và cuộc gọi</h2>
        <div className="setting-item">
          <p>Hiện trạng thái "Đã xem"</p>
          <Switch
            checked={showSeenStatus}
            onChange={(e) => setShowSeenStatus(e)}
          />
        </div>
        <div className="setting-item">
          <p>Cho phép nhắn tin</p>
          <Select
            value={allowMessaging}
            onChange={(value) => setAllowMessaging(value)}
            style={{ width: 200 }}
          >
            <Option value="all">Tất cả mọi người</Option>
            <Option value="specific">Bạn bè</Option>
          </Select>
        </div>
        <div className="setting-item">
          <p>Cho phép gọi điện</p>
          <Select
            value={allowCalls}
            onChange={(value) => setAllowCalls(value)}
            style={{ width: 200 }}
          >
            <Option value="friendsAndContacts">
              Bạn bè và người lạ từng liên hệ
            </Option>
            <Option value="specific">Bạn bè</Option>
            <Option value="all">Tất cả mọi người</Option>
          </Select>
        </div>
        <h2>Chặn tin nhắn </h2>
        <div className="setting-item">
          <button className="button-blockList" onClick={handleBlockListClick}>
            <div> Danh sách chặn</div>
            <div>
              <FiChevronRight />
            </div>
          </button>
        </div>
        <h2>Nguồn tìm kiếm</h2>
        <div className="setting-item">
          <p>
            Cho phép người lạ tìm thấy và kết bạn qua số điện thoại
            <Switch
              checked={allowStrangerSearch}
              onChange={(e) => setAllowStrangerSearch(e)}
            />
          </p>
        </div>
        {/* <div className="setting-item">
        <label>
          Cho phép người lạ kết bạn
          <Switch
            checked={allowStrangerFriendRequest}
            onChange={(e) => setAllowStrangerFriendRequest(e)}
          />
        </label>
      </div> */}

        <h2>Cho phép người lạ kết bạn</h2>
        <div className="setting-item">
          <Checkbox
            checked={friendRequestOptions.qrCode}
            onChange={() => handleFriendRequestOptionChange("qrCode")}
          >
            Mã QR của tôi
          </Checkbox>
        </div>
        <div className="setting-item">
          <Checkbox
            checked={friendRequestOptions.commonGroups}
            onChange={() => handleFriendRequestOptionChange("commonGroups")}
          >
            Nhóm chung
          </Checkbox>
        </div>
        <div className="setting-item">
          <Checkbox
            checked={friendRequestOptions.zaloCard}
            onChange={() => handleFriendRequestOptionChange("zaloCard")}
          >
            Danh thiếp Zalo
          </Checkbox>
        </div>
        <div className="setting-item">
          <Checkbox
            checked={friendRequestOptions.suggestedFriends}
            onChange={() => handleFriendRequestOptionChange("suggestedFriends")}
          >
            Gợi ý "Có thể bạn quen"
          </Checkbox>
        </div>
      </div>
      <div className={`blockList-contents ${showBlockList ? "slide-in" : ""}`}>
        <div style={{ gap: "10px", display: "flex", alignItems: "center" }}>
          <FaChevronLeft
            style={{ marginBottom: "8px", fontSize: "20px", cursor: "pointer" }}
            onClick={handleBackClick}
          />
          <h1>Danh sách đã chặn</h1>
        </div>
        <div className="box-blockList">
          <p>Bạn chưa chặn ai</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;
