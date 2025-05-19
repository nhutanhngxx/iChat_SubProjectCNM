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
import { Modal, Spinner } from "react-bootstrap";
import LoginWithQR from "./LoginWithQR"
import RegisterModal from "../Register/register.jsx";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import ForgotPasswordModal from "../ForgetPassword/ForgotPasswordModal.jsx"
import { parsePhoneNumberFromString } from "libphonenumber-js";


export default function LoginWithPass() {
  // Khai báo state cho form đăng nhập
  const [loginWithQR, setLoginWithQR] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);
  //   Lấy dữ liệu phone và pass từ form
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  //  Lấy dữ liệu từ store
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [countryCode, setCountryCode] = useState("VN");
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [phoneError, setPhoneError] = useState("Số điện thoại không hợp lệ");

  // Open Register
  const [showRegister, setShowRegister] = useState(false);
  // Open Forgot Password
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const validVnPrefixes = [
    "032", "033", "034", "035", "036", "037", "038", "039", // Viettel
    "070", "076", "077", "078", "079", "089", "090", "093", // Mobifone
    "081", "082", "083", "084", "085", "088", "091", "094", // Vinaphone
    "056", "058", "092",                                     // Vietnamobile
    "059", "099",                                            // Gmobile
    "086", "096", "097", "098",                              // Viettel (cũ)
  ];

  // Sửa lỗi khai báo `error` bị trùng
  const { user, token, loading, error } = useSelector((state) => state.auth);
  //  Hàm xử lý đăng nhập
  const handleLogin = async (e) => {
    e.preventDefault();
    // console.log("Form submitted", e); // Thêm log để kiểm tra

    try {
      const phoneNumber = parsePhoneNumberFromString(phone, countryCode);
      // console.log("Sending login request with:", { phone: phoneNumber?.number, password: '***' });

      await dispatch(loginUser({ phone: phoneNumber.number, password })).unwrap(); // unwrap để lấy dữ liệu từ createAsyncThunk
      if (token || localStorage.getItem("token")) {
        navigate("/home");
      }
    } catch (err) {
      console.error("Đăng nhập thất bại:", err);
    }
  };


  const validatePhone = (value) => {
    const isVietnam = countryCode === "+84";

    if (!/^\d*$/.test(value)) {
      return "Chỉ được nhập số";
    }

    if (isVietnam) {
      if (value.length < 10) {
        return "Số điện thoại Việt Nam phải đủ 10 số";
      }
      if (value.length > 10) {
        return "Số điện thoại Việt Nam không được quá 10 số";
      }

      if (!/^0\d{9}$/.test(value)) {
        return "Số Việt Nam phải bắt đầu bằng 0";
      }

      // const prefix = value.substring(0, 3);
      // if (!validVnPrefixes.includes(prefix)) {
      //   return "Đầu số Việt Nam không hợp lệ";
      // }
      const phoneNumber = parsePhoneNumberFromString(value, countryCode);
      if (!phoneNumber || !phoneNumber.isValid()) {
        return "Số điện thoại không hợp lệ";
      }
    } else {
      if (value.length < 6) return "Số điện thoại quá ngắn";
      if (value.length > 15) return "Số điện thoại quá dài";
    }

    return ""; // ✅ Hợp lệ
  };

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Chỉ cho phép nhập số
    setPhone(value);
    const error = validatePhone(value);
    setPhoneError(error);
  };
  // console.log("User:", user);
  // console.log("Token:", token);

  return (
    <div className="container-login">
      <div className="container-header">
        <div className="container-header-logo">
          <img
            // src="https://i.ibb.co/LVnMJ5t/i-Chat-removebg-preview.png"
            src="https://i.ibb.co/TGJ0mZm/logo-ichat-removebg.png"
            style={{ width: "160px", height: "160px" }}
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
              style={{ position: "relative", top: "-67%", right: "-26%", cursor: "pointer" }}
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
          <LoginWithQR />
        ) : (
          <>
            <form onSubmit={handleLogin} className="login-form">
              <div className="input-container">
                <div className="input-wrapper">
                  {/* Country code và phone input */}
                  <div className="icons">
                    <MdPhoneAndroid className="icon" />
                  </div>
                  <div className="country-code-wrapper">
                    <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} style={{ width: "30px", border: "none", }}>
                      <option value="VN">+84 (VN)</option>
                      <option value="US">+1 (US)</option>
                      <option value="KR">+82 (KR)</option>
                      <option value="JP">+81 (JP)</option>
                      <option value="CN">+86 (CN)</option>
                    </select>
                    <div className="icons">
                      <FaCaretDown className="icon" />
                    </div>
                  </div>

                  <input
                    type="text"
                    value={phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                    style={{ marginBottom: "0px" }}
                    className={`phone-input ${phone === "" ? "" : phoneError ? "error" : "success"}`}
                  />
                </div>

                <div className="input-wrapper">
                  <div className="icons">
                    <IoLockClosedOutline className="icon" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-field"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleLogin(e);
                      }
                    }}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>

              {phone !== "" && phoneError && (
                <p className="error-text" style={{ color: "red", marginLeft: "30px", fontSize: "10px" }}>{phoneError}</p>
              )}
              {error && (
                <p className="error" style={{ color: "red", marginLeft: "30px", fontSize: "10px" }}>
                  {error}
                </p>
              )}

              <div className="container-body-button">
                <button type="submit" disabled={loading}>
                  {loading ? "Đang đăng nhập..." : "Đăng nhập với mật khẩu"}
                </button>
              </div>
            </form>

            <div className="container-body-link">
              <button style={{}} onClick={() => setShowForgotPassword(true)} >Quên mật khẩu?</button>
              <button onClick={() => setShowRegister(true)}>
                Đăng ký ngay
              </button>
              <ForgotPasswordModal
                visible={showForgotPassword} onClose={() => setShowForgotPassword(false)}
              />
              <RegisterModal
                visible={showRegister} onClose={() => setShowRegister(false)}
              />
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