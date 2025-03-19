import React from "react";
import { Menu, Dropdown, Button } from "antd";
import {
  PushpinOutlined,
  FolderOutlined,
  EyeInvisibleOutlined,
  DeleteOutlined,
  FlagOutlined,
  BellOutlined,
  PlusOutlined,
} from "@ant-design/icons";



const MenuMdMoreHoriz = ({ onPin }) => {
  const menuItems = [
    { key: "1", label: "Ghim hội thoại", icon: <PushpinOutlined />, onClick: onPin, },
    {
      key: "2",
      label: "Phân loại",
      icon: <FolderOutlined />,
      // children: [
      //   { key: "2-1", label: "Bạn bè" },
      //   { key: "2-2", label: "Công việc" },
      // ],
    },
    { key: "3", label: "Đánh dấu chưa đọc" },
    { key: "4", label: "Thêm vào nhóm", icon: <PlusOutlined /> },
    {
      key: "5",
      label: "Tắt thông báo",
      icon: <BellOutlined />,
      children: [
        { key: "5-1", label: "Trong 1 giờ" },
        { key: "5-2", label: "Trong 8 giờ" },
        { key: "5-3", label: "Cho đến khi được mở lại" },
      ],
    },
    { key: "6", label: "Ẩn trò chuyện", icon: <EyeInvisibleOutlined /> },
    {
      key: "7",
      label: "Tin nhắn tự xóa",
      children: [
        { key: "7-1", label: "Sau 1 ngày" },
        { key: "7-2", label: "Sau 7 ngày" },
        { key: "7-3", label: "Sau 14 ngày" },
        { key: "7-4", label: "Không bao giờ" },
      ],
    },
    {
      key: "8",
      label: <span style={{ color: "red" }}>Xóa hội thoại</span>,
      icon: <DeleteOutlined style={{ color: "red" }} />,
    },
    { key: "9", label: "Báo xấu", icon: <FlagOutlined /> },
  ];
  return <Menu items={menuItems} style={{ width: 224 }} />;
};

export default MenuMdMoreHoriz;
