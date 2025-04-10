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

  const [countryCode, setCountryCode] = useState("+84");
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [phoneError, setPhoneError] = useState("Số điện thoại không hợp lệ");

  // Open Register
  const [showRegister, setShowRegister] = useState(false);
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
    try {
      await dispatch(loginUser({ phone, password })).unwrap(); // unwrap để lấy dữ liệu từ createAsyncThunk
      if (token || localStorage.getItem("token")) {
        navigate("/home");
      }
    } catch (err) {
      console.error("Đăng nhập thất bại:", err);
    }
  };

  // Khai báo state mới để lưu lỗi nhập số điện thoại

  // const handleChange = (e) => {
  //   let value = e.target.value;

  //   // Chỉ cho phép nhập số
  //   if (!/^\d*$/.test(value)) return;

  //   // Giới hạn tối đa 10 số
  //   if (value.length > 10) return;

  //   setPhone(value);

  //   // Kiểm tra điều kiện hợp lệ ngay khi nhập
  //   if (!/^0\d{0,9}$/.test(value)) {
  //     setPhoneError("Số điện thoại phải bắt đầu bằng 0");
  //   } else if (value.length < 10) {
  //     setPhoneError("Số điện thoại phải có đúng 10 số");
  //   } else {
  //     setPhoneError(""); // Hợp lệ
  //   }
  // };

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

      const prefix = value.substring(0, 3);
      if (!validVnPrefixes.includes(prefix)) {
        return "Đầu số Việt Nam không hợp lệ";
      }
    } else {
      if (value.length < 6) return "Số điện thoại quá ngắn";
      if (value.length > 15) return "Số điện thoại quá dài";
    }

    return ""; // ✅ Hợp lệ
  };

  // const handleChange = (e) => {
  //   let value = e.target.value;

  //   // Chỉ cho nhập số
  //   if (!/^\d*$/.test(value)) return;

  //   setPhone(value);

  //   let isValid = false;

  //   // Validate theo từng quốc gia
  //   switch (countryCode) {
  //     case "+84": // Việt Nam
  //       isValid = /^0\d{9}$/.test(value);
  //       break;
  //     case "+1": // US/Canada
  //       isValid = /^\d{10}$/.test(value);
  //       break;
  //     case "+44": // UK
  //       isValid = /^7\d{9}$/.test(value);
  //       break;
  //     case "+91": // Ấn Độ
  //       isValid = /^[6-9]\d{9}$/.test(value);
  //       break;
  //     default:
  //       isValid = value.length > 5; // fallback
  //       break;
  //   }

  //   setIsPhoneValid(isValid);
  //   setPhoneError(isValid ? "" : "Số điện thoại không hợp lệ");
  // };
  const handleChange = (e) => {
    const value = e.target.value;
    setPhone(value);
    const error = validatePhone(value);
    setPhoneError(error);
  };
  console.log("User:", user);
  console.log("Token:", token);

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
          // <div className="qr-container">
          //   <IoMdQrScanner className="qr-icon" />
          //   <p>Chỉ dùng đăng nhập iChat trên máy tính</p>
          // </div>
          <LoginWithQR />
        ) : (
          <>
            <div className="input-container">
              <div className="input-wrapper">
                <div className="icons">
                  <MdPhoneAndroid className="icon" />
                </div>
                <div className="country-code-wrapper">
                  {/* <select
                    className="country-code"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                  >
                    <option value="+84">+84</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+91">+91</option>
                  </select> */}
                  <select value={countryCode} onChange={(e) => {
                    setCountryCode(e.target.value);
                    setPhoneError(validatePhone(phone)); // Revalidate khi đổi mã quốc gia
                  }}
                    style={{ width: "30px", border: "none", }}

                  >
                    <option value="+84">+84 (Việt Nam)</option>
                    <option value="+1">+1 (Mỹ)</option>
                    <option value="+44">+44 (Anh)</option>
                    <option value="+91">+91 (Ấn Độ)</option>
                    <option value="+81">+81 (Nhật)</option>
                  </select>
                  <div className="icons">
                    <FaCaretDown className="icon" />
                  </div>
                </div>
                {/* <input
                  type="text"
                  className={`input-field ${error ? "error" : ""}`}
                  placeholder="Nhập số điện thoại"
                  value={phone}
                  // onChange={(e) => setPhone(e.target.value)}
                  onChange={handleChange}
                /> */}
                {/* <input
                  type="text"
                  className={`input-field ${phone ? (isPhoneValid ? "valid" : "invalid") : ""}`}
                  placeholder="Nhập số điện thoại"
                  value={phone}
                  onChange={handleChange}
                /> */}
                <input
                  type="text"
                  value={phone}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                  style={{ marginBottom: "0px" }}
                  className={`phone-input ${phone === "" ? "" : phoneError ? "error" : "success"}`}
                />

                <style jsx>{`
                  .input-field {
                    width: 100%;
                    padding: 8px;
                    font-size: 16px;
                    border: 2px solid ${error ? "red" : "#ccc"};
                    border-radius: 5px;
                    outline: none;
                  }
                  .error-message {
                    color: red;
                    font-size: 14px;
                    margin-top: 5px;
                  }
                `}</style>
              </div>

              <div className="input-wrapper">
                <div className="icons">
                  <IoLockClosedOutline className="icon" />
                </div>
                <input
                  // type="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}

                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>
            {phone !== "" && phoneError && (
              <p className="error-text" style={{ color: "red", marginLeft: "30px" }}>{phoneError}</p>
            )}
            {error && (
              <p className="error" style={{ color: "red", marginLeft: "30px" }}>
                {error}
              </p>
            )}
            {loading && (
              // <p className="loading" style={{ marginLeft: "30px" }}>
              //   Đang xử lý...
              // </p>

              <div className="loading-overlay">
                <div className="loading-spinner">
                  <div className="loader-dots">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                  <div className="loading-text">Đang xử lý...</div>
                </div>
              </div>
            )}

            <div className="container-body-button">
              <button onClick={handleLogin} disabled={loading}>
                {loading ? "Đang đăng nhập..." : "Đăng nhập với mật khẩu"}
              </button>
            </div>

            <div className="container-body-link">
              <button style={{}}>Quên mật khẩu?</button>
              <button onClick={() => setShowRegister(true)}>
                Đăng ký ngay
              </button>
              <RegisterModal
                visible={showRegister} onClose={() => setShowRegister(false)}
              // onRegister={handleRegister}
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
