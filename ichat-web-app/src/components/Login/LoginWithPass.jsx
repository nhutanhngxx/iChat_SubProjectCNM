import React, { useState } from "react";
import "./LoginWithPass.css";
import { MdPhoneAndroid } from "react-icons/md";
import { IoLockClosedOutline } from "react-icons/io5";
import { FaCaretDown } from "react-icons/fa6";
import { IoMdQrScanner } from "react-icons/io";
import { LuSquareMenu } from "react-icons/lu";

export default function LoginWithPass() {
  const [loginWithQR, setLoginWithQR] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);
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
          {loginWithQR ? (
            <>
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
                        setShowToggleModal(false); // Ẩn modal sau khi chọn
                      }}
                    >
                      {loginWithQR
                        ? "Đăng nhập với mật khẩu"
                        : "Đăng nhập bằng mã QR"}
                    </a>
                  </div>
                )}
              </div>
            </>
          ) : (
            ""
          )}
        </div>

        {loginWithQR ? (
          // Giao diện đăng nhập bằng mã QR
          <div className="qr-container">
            <IoMdQrScanner className="qr-icon" />
            <p>Chỉ dùng đăng nhập iChat trên máy tính</p>
          </div>
        ) : (
          // Giao diện đăng nhập bằng mật khẩu

          <>
            <div class="input-container">
              <div class="input-wrapper">
                <div class="icons">
                  <MdPhoneAndroid className="icon" />
                </div>
                <div class="country-code-wrapper">
                  <select class="country-code">
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
                  class="input-field"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div class="input-wrapper">
                <div className="icons">
                  <IoLockClosedOutline className="icon" />
                </div>
                <input
                  type="password"
                  class="input-field"
                  placeholder="Nhập mật khẩu"
                />
              </div>
            </div>
            <div className="container-body-button">
              <button>Đăng nhập với mật khẩu</button>
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
