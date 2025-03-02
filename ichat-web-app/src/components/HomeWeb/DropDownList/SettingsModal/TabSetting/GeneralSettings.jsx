import React, { useState } from "react";
import { Radio, Select } from "antd";

const { Option } = Select;

const GeneralSettings = () => {
  const [contactsOption, setContactsOption] = useState("zaloOnly");
  const [language, setLanguage] = useState("vi");

  return (
    <>
      <h3>Danh bạ</h3>
      <p>Danh sách bạn bè được hiển thị trong danh bạ</p>
      <Radio.Group
        onChange={(e) => setContactsOption(e.target.value)}
        value={contactsOption}
      >
        <Radio value="all">Hiển thị tất cả bạn bè</Radio>
        <Radio value="zaloOnly">Chỉ hiển thị bạn bè đang sử dụng Zalo</Radio>
      </Radio.Group>

      <h3>Ngôn ngữ</h3>
      <p>Thay đổi ngôn ngữ</p>
      <Select
        value={language}
        onChange={(value) => setLanguage(value)}
        style={{ width: "100%" }}
      >
        <Option value="vi">Tiếng Việt</Option>
        <Option value="en">English</Option>
      </Select>
    </>
  );
};

export default GeneralSettings;
