import React, { useState, useEffect } from "react";
import { MdPhoneAndroid } from "react-icons/md";
import { IoLockClosedOutline } from "react-icons/io5";
import { FaCaretDown } from "react-icons/fa6";
import { IoMdQrScanner } from "react-icons/io";
import { LuSquareMenu } from "react-icons/lu";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";
import "./LoginWithPass.css";

export default function LoginWithPass() {
  // Khai báo state cho form đăng nhập
  const [loginWithQR, setLoginWithQR] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);
  //   Lấy dữ liệu phone và pass từ form
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  //  Lấy dữ liệu từ store
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Sửa lỗi khai báo `error` bị trùng
  const { user, token, loading, error } = useSelector((state) => state.auth);
  //  Hàm xử lý đăng nhập
  // const handleLogin = (e) => {
  //     e.preventDefault();
  //     dispatch(loginUser({ phone, password }));
  // };
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await dispatch(loginUser({ phone, password })).unwrap(); // unwrap để lấy dữ liệu từ createAsyncThunk
      if (token || localStorage.getItem("token")) {
        navigate("/home");
      }
    } catch (err) {
      console.error("Đăng nhập thất bại:", err);
    }
  };

  // Điều hướng khi đăng nhập thành công
  // useEffect(() => {
  //     if (token) {
  //     navigate("/home");
  //     }
  // }, [token, navigate]);
  //   useEffect(() => {
  //     const storedToken = localStorage.getItem("token");
  //     if (token || storedToken) {
  //       navigate("/home");
  //     }
  //   }, [token, navigate]);

  console.log("User:", user);
  console.log("Token:", token);

  return (
    <div className="container-login">
      <div className="container-header">
        <div className="container-header-logo">
          <img
            src="https://i.ibb.co/LVnMJ5t/i-Chat-removebg-preview.png"
            alt="logo_ichat"
          />
        </div>
        <div className="container-header-title">
          <p>Đăng nhập tài khoản iChat để kết nối với ứng dụng iChat Web</p>
        </div>
      </div>

      <div className="container-body">
        <div className="container-body-title">
          <h2>
            {loginWithQR ? "Đăng nhập qua mã QR" : "Đăng nhập bằng mật khẩu"}
          </h2>
          {loginWithQR && (
            <div
              className="menu-mini"
              onClick={() => setShowToggleModal(!showToggleModal)}
            >
              <LuSquareMenu
                className="icon"
                style={{ width: "20px", height: "20px" }}
              />
              {showToggleModal && (
                <div className="toggle-login-mode">
                  <a
                    href="#"
                    onClick={() => {
                      setLoginWithQR(!loginWithQR);
                      setShowToggleModal(false);
                    }}
                  >
                    Đăng nhập với mật khẩu
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {loginWithQR ? (
          <div className="qr-container">
            <IoMdQrScanner className="qr-icon" />
            <p>Chỉ dùng đăng nhập iChat trên máy tính</p>
          </div>
        ) : (
          <>
            <div className="input-container">
              <div className="input-wrapper">
                <div className="icons">
                  <MdPhoneAndroid className="icon" />
                </div>
                <div className="country-code-wrapper">
                  <select className="country-code">
                    <option value="+84">+84</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+91">+91</option>
                  </select>
                  <div className="icons">
                    <FaCaretDown className="icon" />
                  </div>
                </div>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Nhập số điện thoại"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="input-wrapper">
                <div className="icons">
                  <IoLockClosedOutline className="icon" />
                </div>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <p className="error" style={{ color: "red", marginLeft: "30px" }}>
                {error}
              </p>
            )}
            {loading && (
              <p className="loading" style={{ marginLeft: "30px" }}>
                Đang xử lý...
              </p>
            )}

            <div className="container-body-button">
              <button onClick={handleLogin} disabled={loading}>
                {loading ? "Đang đăng nhập..." : "Đăng nhập với mật khẩu"}
              </button>
            </div>

            <div className="container-body-link">
              <a href="#">Quên mật khẩu?</a>
            </div>

            <div className="container-body-link_QR">
              <a href="#" onClick={() => setLoginWithQR(!loginWithQR)}>
                Đăng nhập bằng mã QR
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
