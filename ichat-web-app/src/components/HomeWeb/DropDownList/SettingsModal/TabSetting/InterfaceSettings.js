import React, { useState } from "react";
import { Radio, Switch } from "antd";
import "./css/InterfaceSettings.css";

const InterfaceSettings = () => {
  const [theme, setTheme] = useState("light");
  const [useAvatarAsBackground, setUseAvatarAsBackground] = useState(false);

  return (
    <div className="interface-settings">
      <h2>Cài đặt giao diện Beta</h2>

      <div className="setting-item">
        <label>Chế độ giao diện</label>
        <Radio.Group value={theme} onChange={(e) => setTheme(e.target.value)}>
          <Radio value="light">Sáng</Radio>
          <Radio value="dark">Tối</Radio>
          <Radio value="system">Hệ Thống</Radio>
        </Radio.Group>
      </div>

      <div className="setting-item">
        <label>Hình nền chat</label>
        <div className="background-options">
          <label>
            Sử dụng Avatar làm hình nền
            <Switch
              checked={useAvatarAsBackground}
              onChange={(checked) => setUseAvatarAsBackground(checked)}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default InterfaceSettings;
