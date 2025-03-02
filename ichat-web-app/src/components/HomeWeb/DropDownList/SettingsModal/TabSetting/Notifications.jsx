import React, { useState } from "react";
import { Switch } from "antd";
import "./css/Notifications.css";
import { GrPersonalComputer } from "react-icons/gr";

const NotificationSettings = () => {
  const [notifyNewMessage, setNotifyNewMessage] = useState(true);
  const [playSound, setPlaySound] = useState(true);

  return (
    <div className="notification-settings">
      <h2>Cài đặt thông báo</h2>

      <div className="setting-item notify-new-message">
        <p>Nhận được thông báo mỗi khi có tin nhắn mới</p>
        <Switch
          checked={notifyNewMessage}
          onChange={(checked) => setNotifyNewMessage(checked)}
        />
      </div>

      <div className="setting-item notify-new-message">
        <div className="setting-item-notify-sound-new">
          <label>Âm thanh thông báo</label>

          <div className="setting-item-notify-sound-new-switch">
            <p>Phát âm thanh khi có tin nhắn & thông báo mới</p>
            <Switch
              checked={playSound}
              onChange={(checked) => setPlaySound(checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
