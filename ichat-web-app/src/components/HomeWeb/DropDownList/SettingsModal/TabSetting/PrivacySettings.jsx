import React, { useState } from "react";
import "./css/PrivacySettings.css";
import { FiChevronRight } from "react-icons/fi";
import { Switch, Select, Checkbox } from "antd";
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

  return (
    <div className="privacy-settings">
      <h2>Cá nhân</h2>
      <div className="setting-item">
        <label>
          Hiện ngày sinh
          <Switch checked={showBirthday} onChange={(e) => setShowBirthday(e)} />
        </label>
      </div>
      <div className="setting-item">
        <label>
          Hiển thị trạng thái truy cập
          <Switch
            checked={showOnlineStatus}
            onChange={(e) => setShowOnlineStatus(e)}
          />
        </label>
      </div>

      <h2>Tin nhắn và cuộc gọi</h2>
      <div className="setting-item">
        <label>
          Hiện trạng thái "Đã xem"
          <Switch
            checked={showSeenStatus}
            onChange={(e) => setShowSeenStatus(e)}
          />
        </label>
      </div>
      <div className="setting-item">
        <label>
          Cho phép nhắn tin
          <Select
            value={allowMessaging}
            onChange={(value) => setAllowMessaging(value)}
            style={{ width: 200 }}
          >
            <Option value="all">Tất cả mọi người</Option>
            <Option value="specific">Bạn bè</Option>
          </Select>
        </label>
      </div>
      <div className="setting-item">
        <label>
          Cho phép gọi điện
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
        </label>
      </div>
      <h2>Chặn tin nhắn </h2>
      <div className="setting-item">
        <button className="button-blockList">
          <div> Danh sách chặn</div>
          <div>
            <FiChevronRight />
          </div>
        </button>
      </div>
      <h2>Nguồn tìm kiếm</h2>
      <div className="setting-item">
        <label>
          Cho phép người lạ tìm thấy và kết bạn qua số điện thoại
          <Switch
            checked={allowStrangerSearch}
            onChange={(e) => setAllowStrangerSearch(e)}
          />
        </label>
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
        <label>
          <Checkbox
            checked={friendRequestOptions.qrCode}
            onChange={() => handleFriendRequestOptionChange("qrCode")}
          >
            Mã QR của tôi
          </Checkbox>
        </label>
      </div>
      <div className="setting-item">
        <label>
          <Checkbox
            checked={friendRequestOptions.commonGroups}
            onChange={() => handleFriendRequestOptionChange("commonGroups")}
          >
            Nhóm chung
          </Checkbox>
        </label>
      </div>
      <div className="setting-item">
        <label>
          <Checkbox
            checked={friendRequestOptions.zaloCard}
            onChange={() => handleFriendRequestOptionChange("zaloCard")}
          >
            Danh thiếp Zalo
          </Checkbox>
        </label>
      </div>
      <div className="setting-item">
        <label>
          <Checkbox
            checked={friendRequestOptions.suggestedFriends}
            onChange={() => handleFriendRequestOptionChange("suggestedFriends")}
          >
            Gợi ý "Có thể bạn quen"
          </Checkbox>
        </label>
      </div>
    </div>
  );
};

export default PrivacySettings;
