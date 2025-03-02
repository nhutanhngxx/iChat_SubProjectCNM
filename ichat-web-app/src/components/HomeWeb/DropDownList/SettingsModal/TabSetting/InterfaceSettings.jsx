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
        {/* <label>Chế độ giao diện</label> */}
        <Radio.Group
          className="radio-group"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        >
          <div>
            <img src="https://i.ibb.co/9338MbM6/light.png" alt="" />
            <Radio value="light">Sáng</Radio>
          </div>
          <div>
            <img src="https://i.ibb.co/tpY2VtZL/dark.png" alt="" />
            <Radio value="dark">Tối</Radio>
          </div>
          <div>
            <img src="https://i.ibb.co/VYd2nhtw/system.png" alt="" />
            <Radio value="system">Hệ Thống</Radio>
          </div>
        </Radio.Group>
      </div>

      <div className="setting-item">
        <label>Hình nền chat</label>
        <div className="background-options">
          <p>
            Sử dụng Avatar làm hình nền
            <Switch
              checked={useAvatarAsBackground}
              onChange={(checked) => setUseAvatarAsBackground(checked)}
            />
          </p>
        </div>
      </div>
    </div>
  );
};

export default InterfaceSettings;
