// ForgotPasswordModal.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} from "libphonenumber-js";
import "./ForgotPasswordModal.css";
import { useDispatch } from "react-redux";
import { checkExistedPhone } from "../../redux/slices/authSlice";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  sendOtpFirebase,
  verifyOtpFirebase,
  resetPassword,
} from "../../redux/slices/authSlice";

const ForgotPasswordModal = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Mã quốc gia
  const [countryCode, setCountryCode] = useState("VN");
  //Timer đếm ngược
  const [countdown, setCountdown] = useState(60);
  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  // chuyển sang bước tiếp theo hoặc quay lại bước trước
  const handleNextStep = () => {
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePreviousStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };
  // reset capcha
  const resetRecaptcha = () => {
    // Clear existing reCAPTCHA
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.error("Error clearing reCAPTCHA:", e);
      }
      window.recaptchaVerifier = null;
    }

    // Reset container
    const container = document.getElementById("recaptcha-container");
    if (container) {
      container.innerHTML = "";
    }
  };

  // Hàm bắt đầu đếm ngược
  const startCountdown = () => {
    setCountdown(60); // reset về 60s
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  //Hàm dừng đếm ngược
  const stopCountdown = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCountdown(0);
  };

  const handlePhoneSubmit = async () => {
    const regexPhone = /^[0-9]{9,11}$/;
    if (!phone.match(regexPhone)) return alert("Số điện thoại không hợp lệ");
    const parsedPhone = parsePhoneNumberFromString(phone, countryCode);
    if (!parsedPhone || !parsedPhone.isValid())
      return alert("Số điện thoại không hợp lệ");

    const phoneNumber = parsedPhone.number;

    // Check xem đã tồn tại chưa
    const resultAction = await dispatch(checkExistedPhone(phoneNumber));
    if (checkExistedPhone.fulfilled.match(resultAction)) {
      console.log("Số điện thoại chưa tồn tại.");

      return alert("Số điện thoại chưa đăng ký.");
    }
    resetRecaptcha(); // Reset reCAPTCHA when the modal is closed

    const resultOtp = await dispatch(sendOtpFirebase(phoneNumber));
    if (sendOtpFirebase.fulfilled.match(resultOtp)) {
      startCountdown(); // Bắt đầu đếm ngược
      handleNextStep(); // sang bước nhập OTP
    } else {
      console.error("Không thể gửi mã OTP: ", resultOtp.payload);

      alert("Không thể gửi mã OTP: " + resultOtp.payload);
    }
  };
  // Gửi lại mã OTP
  const handleResendOtp = async () => {
    try {
      const parsedPhone = parsePhoneNumberFromString(phone, countryCode);
      if (!parsedPhone || !parsedPhone.isValid()) {
        return alert("Số điện thoại không hợp lệ");
      }

      // Don't call handleNextStep() since we're already on step 2
      const resultOtp = await dispatch(sendOtpFirebase(parsedPhone.number));

      if (sendOtpFirebase.fulfilled.match(resultOtp)) {
        startCountdown(); // Start countdown again
        alert("Đã gửi lại mã OTP thành công!");
      } else {
        console.error("Không thể gửi lại mã OTP: ", resultOtp.payload);
        alert("Không thể gửi lại mã OTP: " + resultOtp.payload);
      }
    } catch (error) {
      console.error("Error in resend OTP:", error);
      alert("Đã xảy ra lỗi khi gửi lại mã OTP");
    }
  };

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpSubmit = async () => {
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) return alert("OTP chưa đủ 6 số");

    const resultVerify = await dispatch(verifyOtpFirebase(fullOtp));
    if (verifyOtpFirebase.fulfilled.match(resultVerify)) {
      setStep(3);
    } else {
      alert("OTP không chính xác");
    }
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    return regex.test(password);
  };

  const handlePasswordReset = async () => {
    if (!validatePassword(newPassword)) {
      return alert("Mật khẩu phải tối thiểu 6 ký tự, có chữ hoa và số");
    }
    if (newPassword !== confirmPassword) {
      return alert("Mật khẩu nhập lại không khớp");
    }

    const parsedPhone = parsePhoneNumberFromString(phone, countryCode);
    const result = await dispatch(
      resetPassword({ phone: parsedPhone.number, newPassword })
    );
    if (resetPassword.fulfilled.match(result)) {
      alert("Đổi mật khẩu thành công!");
      onClose();
    } else {
      alert(result.payload || "Đặt lại mật khẩu thất bại");
    }
  };

  useEffect(() => {
    return () => {
      if (visible) {
        resetRecaptcha();
        stopCountdown();
      }
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal forgot-modal">
        <button
          style={{
            right: "0",
            top: "0",
            width: "40px",
            height: "40px",
            borderRadius: "20px 0 0 20px",
            backgroundColor: "#d8d3d3",
          }}
          className="close-btn"
          onClick={onClose}
        >
          X
        </button>
        <img
          style={{
            width: "150px",
            height: "auto",
          }}
          src="https://i.ibb.co/TGJ0mZm/logo-ichat-removebg.png"
          alt="logo-ichat"
        />

        {step === 1 && (
          <>
            <h2>Quên mật khẩu</h2>
            {/* Chọn quốc gia */}
            <div style={{ display: "flex", marginTop: "10px" }}>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                style={{ width: "100px" }}
              >
                <option value="VN">+84 (VN)</option>
                <option value="US">+1 (US)</option>
                <option value="KR">+82 (KR)</option>
                <option value="JP">+81 (JP)</option>
                <option value="CN">+86 (CN)</option>
              </select>
              <input
                type="tel"
                placeholder="Nhập số điện thoại"
                value={phone}
                // onChange={(e) => setPhone(e.target.value)}
                onChange={(e) => {
                  const onlyNums = e.target.value.replace(/\D/g, ""); // loại bỏ mọi ký tự không phải số
                  setPhone(onlyNums);
                }}
              />
            </div>
            <button
              style={{ width: "80%", alignSelf: "center" }}
              onClick={handlePhoneSubmit}
            >
              Gửi mã OTP
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Nhập mã OTP</h2>
            <div className="otp-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  ref={(el) => (otpRefs.current[index] = el)}
                />
              ))}
            </div>
            {/* Đếm ngược hoặc nút gửi lại mã */}
            {countdown > 0 ? (
              <p style={{ textAlign: "center" }}>
                Bạn có thể gửi lại mã sau: {countdown}s
              </p>
            ) : (
              <button
                className="resend-otp"
                onClick={() => {
                  handleResendOtp();
                }}
                style={{ width: "100%" }}
              >
                Gửi lại mã OTP
              </button>
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column-reverse",
                gap: "10px",
              }}
            >
              <button
                style={{
                  width: "40%",
                  alignSelf: "center",
                  borderRadius: "20px 0 0 20px",
                }}
                onClick={handlePreviousStep}
              >
                Quay lại
              </button>
              <button
                style={{ width: "80%", alignSelf: "center" }}
                onClick={handleOtpSubmit}
              >
                Xác nhận OTP
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2>Đặt lại mật khẩu</h2>
            <div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "50px",
                  top: "48%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: "absolute",
                  right: "50px",
                  top: "58%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                }}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column-reverse",
                gap: "10px",
              }}
            >
              <button
                style={{
                  width: "40%",
                  alignSelf: "center",
                  borderRadius: "20px 0 0 20px",
                }}
                onClick={handlePreviousStep}
              >
                Quay lại
              </button>
              <button
                style={{ width: "80%", alignSelf: "center" }}
                onClick={handlePasswordReset}
              >
                Tạo mật khẩu mới
              </button>
            </div>
          </>
        )}
        {/* // Add this div to your ForgotPasswordModal component */}
        <div
          id="recaptcha-container"
          style={{ position: "relative", marginTop: "10px" }}
        ></div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
