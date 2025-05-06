import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Tabs,
  Input,
  Select,
  Divider,
  Table,
  Switch,
  message,
  Tooltip,
} from "antd";
import { QRCode, Space } from "antd";
import {
  LinkOutlined,
  DeleteOutlined,
  CopyOutlined,
  QrcodeOutlined,
  CalendarOutlined,
  TeamOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  createGroupInvitation,
  getGroupInvitations,
  revokeGroupInvitation,
} from "../../../redux/slices/groupSlice";

const { TabPane } = Tabs;
const { Option } = Select;

const GroupInviteModal = ({
  visible,
  onCancel,
  groupId,
  userId,
  groupName,
}) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("1");
  const [expiresIn, setExpiresIn] = useState("24");
  const [maxUses, setMaxUses] = useState("unlimited");
  const [currentInvite, setCurrentInvite] = useState(null);

  const invitations = useSelector((state) => state.groups?.groupInvitations || []);
  const invitationStatus = useSelector((state) => state.groups?.invitationStatus || "idle");
  const currentInvitation = useSelector((state) => state.groups?.currentInvitation || null);
  const [isCreating, setIsCreating] = useState(false);

   // Log state for debugging
  //  console.log("GroupInviteModal Redux State:", {
  //   invitations,
  //   invitationStatus,
  //   currentInvitation,
  //   reduxGroups: useSelector(state => state.groups)
  // });
  // Tải danh sách lời mời khi mở modal
  useEffect(() => {
    if (visible && groupId && userId) {
      dispatch(getGroupInvitations({ groupId, userId }));
    }
  }, [visible, groupId, userId, dispatch]);

  // Cập nhật currentInvite khi có lời mời mới
  useEffect(() => {
    if (currentInvitation) {
      setCurrentInvite(currentInvitation);
      setActiveTab("2"); // Chuyển sang tab hiển thị lời mời
    }
  }, [currentInvitation]);

  // Xử lý tạo lời mời mới
  const handleCreateInvite = () => {
    if (isCreating) return;
  
    setIsCreating(true);
    const hours = parseInt(expiresIn);
    const uses = maxUses === "unlimited" ? null : parseInt(maxUses);
  
    dispatch(
      createGroupInvitation({
        groupId,
        userId,
        expiresInHours: hours,
        maxUses: uses,
      })
    ).unwrap()
      .then(() => {
        dispatch(getGroupInvitations({ groupId, userId }));
        message.success("Đã tạo lời mời thành công");
      })
      .catch(error => {
        message.error("Lỗi khi tạo lời mời: " + error.message);
      })
      .finally(() => {
        setIsCreating(false);
      });
  };
  
  // Xử lý sao chép link
  const handleCopyLink = () => {
    if (currentInvite && currentInvite.inviteUrl) {
      navigator.clipboard
        .writeText(currentInvite.inviteUrl)
        .then(() => {
          message.success("Đã sao chép đường dẫn");
        })
        .catch(() => {
          message.error("Không thể sao chép");
        });
    }
  };

  // Xử lý hủy lời mời
  const handleRevokeInvite = (inviteId) => {
    dispatch(revokeGroupInvitation({ inviteId, userId }))
      .unwrap()
      .then(() => {
        message.success("Đã hủy lời mời");
        if (currentInvite && currentInvite.invitation._id === inviteId) {
          setCurrentInvite(null);
        }
      })
      .catch((err) => {
        message.error("Không thể hủy lời mời: " + err);
      });
  };

  // Format thời gian hết hạn
  const formatExpiry = (expiryDate) => {
    const date = new Date(expiryDate);
    return date.toLocaleString("vi-VN");
  };

  const columns = [
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleString("vi-VN"),
    },
    {
      title: "Hết hạn",
      dataIndex: "expires_at",
      key: "expires_at",
      render: (text) => formatExpiry(text),
    },
    {
      title: "Đã dùng",
      dataIndex: "use_count",
      key: "use_count",
      render: (text, record) =>
        `${text}${record.max_uses ? "/" + record.max_uses : ""}`,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Sao chép đường dẫn">
            <Button
              icon={<CopyOutlined />}
              onClick={() => {
                const inviteUrl = `${window.location.origin}/invite/${record.token}`;
                navigator.clipboard
                  .writeText(inviteUrl)
                  .then(() => message.success("Đã sao chép"))
                  .catch(() => message.error("Không thể sao chép"));
              }}
            />
          </Tooltip>
          <Tooltip title="Xem QR">
            <Button
              icon={<QrcodeOutlined />}
              onClick={() => {
                setCurrentInvite({
                  invitation: record,
                  inviteUrl: `${window.location.origin}/invite/${record.token}`,
                  qrData: record.token,
                });
                setActiveTab("2");
              }}
            />
          </Tooltip>
          <Tooltip title="Hủy lời mời">
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleRevokeInvite(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title={`Quản lý lời mời tham gia nhóm "${groupName || "Nhóm"}"`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Tạo lời mời" key="1">
          <div style={{ padding: "20px 0" }}>
            <h3>Tạo lời mời tham gia nhóm</h3>
            <p>Cài đặt cho lời mời mới</p>

            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <CalendarOutlined style={{ marginRight: 8 }} />
                <span style={{ width: 120 }}>Thời hạn:</span>
                <Select
                  value={expiresIn}
                  onChange={setExpiresIn}
                  style={{ width: 200 }}
                >
                  <Option value="1">1 giờ</Option>
                  <Option value="24">1 ngày</Option>
                  <Option value="168">7 ngày</Option>
                  <Option value="720">30 ngày</Option>
                  <Option value="8760">1 năm</Option>
                </Select>
              </div>

              <div style={{ display: "flex", alignItems: "center" }}>
                <TeamOutlined style={{ marginRight: 8 }} />
                <span style={{ width: 120 }}>Số lần sử dụng:</span>
                <Select
                  value={maxUses}
                  onChange={setMaxUses}
                  style={{ width: 200 }}
                >
                  <Option value="unlimited">Không giới hạn</Option>
                  <Option value="1">1 người</Option>
                  <Option value="5">5 người</Option>
                  <Option value="10">10 người</Option>
                  <Option value="50">50 người</Option>
                  <Option value="100">100 người</Option>
                </Select>
              </div>
            </div>

            <Button
            loading={isCreating} 
            disabled={isCreating} 
              type="primary"
              onClick={handleCreateInvite}
              // loading={invitationStatus === "loading"}
            >
              Tạo lời mời
            </Button>
          </div>
        </TabPane>

        <TabPane tab="Xem lời mời" key="2">
          {currentInvite ? (
            <div style={{ padding: "20px 0", textAlign: "center" }}>
              <h3>Chia sẻ lời mời tham gia nhóm</h3>

              <div style={{ marginBottom: 20 }}>
                <QRCode
                  value={currentInvite.inviteUrl || ""}
                  size={200}
                  style={{ margin: "0 auto" }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <Input.Group compact>
                  <Input
                    style={{ width: "calc(100% - 32px)" }}
                    value={currentInvite.inviteUrl}
                    readOnly
                  />
                  <Tooltip title="Sao chép">
                    <Button icon={<CopyOutlined />} onClick={handleCopyLink} />
                  </Tooltip>
                </Input.Group>
              </div>

              <div>
                <p>
                  Thời hạn: {formatExpiry(currentInvite.invitation.expires_at)}
                </p>
                {currentInvite.invitation.max_uses && (
                  <p>
                    Đã sử dụng: {currentInvite.invitation.use_count}/
                    {currentInvite.invitation.max_uses}
                  </p>
                )}

                <Button
                  danger
                  onClick={() =>
                    handleRevokeInvite(currentInvite.invitation._id)
                  }
                >
                  Hủy lời mời này
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ padding: "20px 0", textAlign: "center" }}>
              <p>Chưa có lời mời nào được tạo hoặc hiển thị</p>
              <Button type="primary" onClick={() => setActiveTab("1")}>
                Tạo lời mời mới
              </Button>
            </div>
          )}
        </TabPane>

        <TabPane tab="Danh sách lời mời" key="3">
          <Table
            columns={columns}
            dataSource={Array.isArray(invitations) ? invitations : []}
            rowKey="_id"
            loading={invitationStatus === "loading"}
            pagination={{ pageSize: 5 }}
          />
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default GroupInviteModal;
