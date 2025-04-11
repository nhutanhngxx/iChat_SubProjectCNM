import React, { useState, useEffect } from "react";
import { Modal, Avatar, Button, Input, Radio, Select } from "antd";
import imageCompression from "browser-image-compression";
import { EditOutlined, LeftOutlined, CloseOutlined } from "@ant-design/icons";
import { CiEdit } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import "./ProfileModal.css";
import { updateUser } from "../../../../redux/slices/userSlide";
import { setUser } from "../../../../redux/slices/authSlice";

// Modal cập nhật thông tin người dùng
const UpdateProfileModal = ({ visible, onClose, user, onUpdateSuccess }) => {
  const [fullName, setFullName] = useState(user?.full_name);
  const [gender, setGender] = useState(user?.gender);
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  

  // Thêm state để lưu giá trị ban đầu
  const [initialValues, setInitialValues] = useState({
    fullName: user?.full_name,
    gender: user?.gender,
    day: "",
    month: "",
    year: ""
  });

  useEffect(() => {
    if (user?.dob) {
      const formatDate = new Date(user?.dob);
      const newDay = formatDate.getDate();
      const newMonth = formatDate.getMonth() + 1;
      const newYear = formatDate.getFullYear();
      
      setDay(newDay);
      setMonth(newMonth);
      setYear(newYear);
      
      // Cập nhật giá trị ban đầu
      setInitialValues({
        fullName: user.full_name,
        gender: user.gender,
        day: newDay,
        month: newMonth,
        year: newYear
      });
    }
  }, [user?.dob]);

  // Hàm kiểm tra có thay đổi
  const hasChanges = () => {
    return (
      fullName !== initialValues.fullName ||
      gender !== initialValues.gender ||
      day !== initialValues.day ||
      month !== initialValues.month ||
      year !== initialValues.year
    );
  };

  // Khi cập nhật ngày tháng năm
  const handleUpdateUser = () => {
    if (!hasChanges()) {
      return; // Không cho phép cập nhật nếu không có thay đổi
    }

    const updatedDob = new Date(Date.UTC(year, month - 1, day));
    const updatedUser = {
      ...user,
      full_name: fullName,
      gender: gender,
      dob: updatedDob.toISOString(),
    };

    onUpdateSuccess(updatedUser);
    onClose();
  };

  return (
    <Modal
      title={
        <div className="update-modal-header">
          <LeftOutlined className="back-icon" onClick={onClose} />
          <span>Cập nhật thông tin cá nhân</span>
          <CloseOutlined className="close-icon" onClick={onClose} />
        </div>
      }
      open={visible}
      footer={null}
      closable={false}
      width={400}
      className="update-profile-modal"
    >
      <div className="update-form">
        <div className="form-section">
          <label>Tên hiển thị</label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="name-input"
          />
        </div>

        <div className="form-section">
          <label>Thông tin cá nhân</label>
          <div className="gender-section">
            <Radio.Group
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <Radio value="Male">Nam</Radio>
              <Radio value="Female">Nữ</Radio>
            </Radio.Group>
          </div>

          <label>Ngày sinh</label>
          <div className="birthday-section">
            {/* onChange={(value) => setDay(Number(value))} */}
            <Select value={day} onChange={setDay} className="date-select">
              {[...Array(31)].map((_, i) => (
                <Select.Option
                  key={i + 1}
                  value={String(i + 1).padStart(2, "0")}
                >
                  {String(i + 1).padStart(2, "0")}
                </Select.Option>
              ))}
            </Select>

            <Select value={month} onChange={setMonth} className="date-select">
              {[...Array(12)].map((_, i) => (
                <Select.Option
                  key={i + 1}
                  value={String(i + 1).padStart(2, "0")}
                >
                  {String(i + 1).padStart(2, "0")}
                </Select.Option>
              ))}
            </Select>

            <Select value={year} onChange={setYear} className="date-select">
              {[...Array(100)].map((_, i) => (
                <Select.Option key={2023 - i} value={String(2023 - i)}>
                  {2023 - i}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>

        <div className="modal-footer">
          <Button onClick={onClose}>Hủy</Button>
          <Button 
            type="primary" 
            onClick={handleUpdateUser}
            disabled={!hasChanges()} // Vô hiệu hóa nút khi không có thay đổi
            className={!hasChanges() ? 'button-disabled' : ''} // Thêm class để style
          >
            Cập nhật
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Modal chính hiển thị thông tin người dùng
const ProfileModal = ({ visible, onClose, user: initialUser }) => {
//   const [isUpdateMode, setIsUpdateMode] = useState(false);
//   const [coverImage, setCoverImage] = useState(initialUser?.cover_path);
//   const [avatarImage, setAvatarImage] = useState(initialUser?.avatar_path);
//   const [userModal, setUserModal] = useState(initialUser || {});
//   const [compressedCoverFile, setCompressedCoverFile] = useState(null);
// const [compressedAvatarFile, setCompressedAvatarFile] = useState(null);
const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [coverImage, setCoverImage] = useState(null);
  const [avatarImage, setAvatarImage] = useState(null);
  const [userModal, setUserModal] = useState(initialUser);
  const [compressedCoverFile, setCompressedCoverFile] = useState(null);
  const [compressedAvatarFile, setCompressedAvatarFile] = useState(null);

  console.log("User mới đã cập nhật trong profile modal: ", initialUser);

  const dispatch = useDispatch();
// Update useEffect to handle initialization and cleanup
useEffect(() => {
  if (initialUser?.id) {
    setUserModal(initialUser);
    setCoverImage(initialUser.cover_path);
    setAvatarImage(initialUser.avatar_path);
  } else {
    // Reset state when user is null (e.g., during logout)
    setUserModal({});
    setCoverImage(null);
    setAvatarImage(null);
    setCompressedCoverFile(null);
    setCompressedAvatarFile(null);
    setIsUpdateMode(false);
  }
}, [initialUser]);
  const hasChanges = () => {

    if (!userModal || !initialUser) return false;

    const avatarInput = document.getElementById("avatar-upload");
    const coverInput = document.getElementById("cover-upload");

    const avatarFile = avatarInput?.files?.[0];
    const coverFile = coverInput?.files?.[0];

    const nameChanged = userModal.full_name !== initialUser.full_name;
    const genderChanged = userModal.gender !== initialUser.gender;
    const dobChanged =
      new Date(userModal.dob).toDateString() !==
      new Date(initialUser.dob).toDateString();
    const avatarChanged = !!avatarFile;
    const coverChanged = !!coverFile;

    return (
      nameChanged ||
      genderChanged ||
      dobChanged ||
      avatarChanged ||
      coverChanged
    );
  };

  const handleCoverChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const options = {
      maxSizeMB: 0.4,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    };
  
    try {
      const compressedFile = await imageCompression(file, options);
      const previewUrl = URL.createObjectURL(compressedFile);
      setCoverImage(previewUrl);
      setCompressedCoverFile(compressedFile); // lưu lại để upload
    } catch (error) {
      console.error("Lỗi khi nén ảnh bìa:", error);
    }
  };
  

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const options = {
      maxSizeMB: 0.2,
      maxWidthOrHeight: 600,
      useWebWorker: true,
    };
  
    try {
      const compressedFile = await imageCompression(file, options);
      const previewUrl = URL.createObjectURL(compressedFile);
      setAvatarImage(previewUrl);
      setCompressedAvatarFile(compressedFile); // lưu lại để upload
    } catch (error) {
      console.error("Lỗi khi nén ảnh avatar:", error);
    }
  };
  

  const handleUpdateUserData = async () => {

    if (!hasChanges()) {
      return;
    }

      // Check for valid user ID first
  if (!userModal?.id) {
    console.error("Missing userId");
    alert("Lỗi: Không tìm thấy thông tin người dùng");
    return;
  }
  
    const formData = new FormData();
    formData.append("full_name", userModal.full_name);
    formData.append("gender", userModal.gender);
    const dobDate = new Date(userModal.dob);
    formData.append("dob", dobDate.toISOString());
  
    // Ưu tiên file đã nén
    if (compressedAvatarFile) {
      formData.append("avatar", compressedAvatarFile);
    } else {
      const avatarInput = document.getElementById("avatar-upload");
      const avatarFile = avatarInput?.files?.[0];
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }
    }
    formData.append("cover", compressedCoverFile);
  
    if (compressedCoverFile) {
      // formData.append("cover", compressedCoverFile);
    } else {
      const coverInput = document.getElementById("cover-upload");
      const coverFile = coverInput?.files?.[0];
      if (coverFile) {
        formData.append("cover", coverFile);
      }
    }
  
    try {
      
      const action = await dispatch(
        updateUser({ userId: userModal.id, formData })
      );
      if (updateUser.fulfilled.match(action)) {
       // Cập nhật cả local state và redux store
      const updatedUserData = action.payload;
      dispatch(setUser({
        ...userModal,
        ...updatedUserData,
        id: userModal.id,
      }));
      
      // Cập nhật các state khác
      setCoverImage(updatedUserData.cover_path);
      setAvatarImage(updatedUserData.avatar_path);
      setCompressedCoverFile(null);
      setCompressedAvatarFile(null);

      alert("Cập nhật thành công!");
     
      onClose();
      } else {
        alert(action.payload?.message || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      alert("Lỗi kết nối server!");
    }
  };
  // Thêm useEffect để đồng bộ state khi initialUser thay đổi
useEffect(() => {
  if (initialUser?.id) {
    setUserModal(initialUser);
    setCoverImage(initialUser.cover_path);
    setAvatarImage(initialUser.avatar_path);
    setCompressedCoverFile(null);
    setCompressedAvatarFile(null);
  }
}, [initialUser]);
  
  const handleUserUpdated = (updatedUser) => {
    setUserModal((prevUser) => ({
      ...prevUser,
      ...updatedUser,
    }));
  };

  if (isUpdateMode) {
    return (
      <UpdateProfileModal
        visible={visible}
        onClose={() => setIsUpdateMode(false)}
        user={userModal}
        onUpdateSuccess={handleUserUpdated}
      />
    );
  }
  
  
  return (
    <Modal
      title={
        <div className="modal-header">
          <span>Thông tin tài khoản</span>
        </div>
      }
      open={visible}
      footer={null}
      closable={true}
      onCancel={onClose}
      width={400}
      centered
      className="profile-modal"
    >
      <div className="profile-container">
        <div
          className="cover-photo"
          onClick={() => document.getElementById("cover-upload").click()}
          style={{ cursor: "pointer" }}
          title="Thay đổi ảnh bìa"
        >
          <input
            id="cover-upload"
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleCoverChange}
            style={{ display: "none" }}
          />
          <img
            src={coverImage || userModal?.cover_path}
            alt="cover"
            className="cover-img"
          />
        </div>

        <div className="profile-details">
          <div
            className="avatar-wrapper"
            onClick={() => document.getElementById("avatar-upload").click()}
            style={{ cursor: "pointer" }}
            title="Thay đổi ảnh đại diện"
          >
            <Avatar size={70} src={avatarImage || userModal?.avatar_path} />
            <input
              id="avatar-upload"
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
              
            />
          </div>
          <span className="profile-name">{userModal?.full_name || ""}</span>
          <EditOutlined
            className="edit-icon"
            onClick={() => setIsUpdateMode(true)}
          />
        </div>
      </div>

      <div className="info-section">
        <p>
          <strong>Giới tính:</strong>{" "}
          {userModal?.gender === "Male" ? "Nam" : "Nữ"}
        </p>
        <p>
          <strong>Ngày sinh:</strong>{" "}
          {userModal?.dob
            ? new Date(userModal.dob)
                .toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
                .replace(/\//g, "-")
            : "Chưa cập nhật"}
          {/* {new Date(user?.dob).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            })} */}
        </p>
        <p>
          <strong>Điện thoại:</strong> {userModal?.phone || "Chưa cập nhật"}
        </p>
      </div>

      <div className="update-section">
        <button 
          className={`update-button ${!hasChanges() ? 'no-changes' : ''}`}
          onClick={hasChanges() ? handleUpdateUserData : undefined}
        >
          <div>
            <CiEdit className="icon-ciedit" />
          </div>
          <p>Cập nhật</p>
        </button>
      </div>
    </Modal>
  );
};

export default ProfileModal;