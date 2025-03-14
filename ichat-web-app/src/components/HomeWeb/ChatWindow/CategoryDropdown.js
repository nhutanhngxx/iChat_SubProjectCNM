import { Dropdown, Menu, Tag, Space } from "antd";
import { DownOutlined, TagOutlined } from "@ant-design/icons";

const items = [
  { key: "1", label: "Khách hàng", color: "red" },
  { key: "2", label: "Gia đình", color: "magenta" },
  { key: "3", label: "Công việc", color: "orange" },
  { key: "4", label: "Bạn bè", color: "gold" },
  { key: "5", label: "Trả lời sau", color: "green" },
  { key: "6", label: "Đồng nghiệp", color: "blue" },
];

const menu = (
  <Menu>
    {items.map((item) => (
      <Menu.Item key={item.key}>
        <Tag color={item.color}>{item.label}</Tag>
      </Menu.Item>
    ))}
    <Menu.Divider />
    <Menu.Item key="manage">Quản lý thẻ phân loại</Menu.Item>
  </Menu>
);

const LabelDropdown = () => (
  <Dropdown overlay={menu} trigger={["click"]}>
    <Space>
      <TagOutlined style={{ cursor: "pointer" }} />
      <DownOutlined />
    </Space>
  </Dropdown>
);

export default LabelDropdown;
