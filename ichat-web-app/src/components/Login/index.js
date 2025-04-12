import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Typography,
  Button,
  Input,
  message,
  Card,
  Alert,
} from "antd";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useNavigate } from "react-router-dom";
import { PhoneOutlined, LockOutlined } from "@ant-design/icons";
import "./Login.css";
import LoginWithPass from "./LoginWithPass";

const { Title } = Typography;

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const navigate = useNavigate();

  useEffect(() => {
    if (showOtpField && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, showOtpField]);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {
            console.log("reCAPTCHA verified");
          },
        }
      );
    }
  };

  const handleSendOtp = async () => {
    if (!phoneNumber) {
      message.error("Vui lòng nhập số điện thoại");
      return;
    }

    // Tự động thêm mã quốc gia +84 nếu số bắt đầu bằng 0
    const formattedPhone = phoneNumber.startsWith("0")
      ? `+84${phoneNumber.slice(1)}`
      : `+${phoneNumber}`;

    setLoading(true);
    try {
      setupRecaptcha();
      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhone, // Sử dụng số đã định dạng
        window.recaptchaVerifier
      );
      setConfirmationResult(confirmation);
      setShowOtpField(true);
      setCountdown(60);
      message.success("Mã OTP đã được gửi");
    } catch (error) {
      message.error(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      message.error("Mã OTP phải có 6 chữ số");
      return;
    }

    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      message.success("Đăng nhập thành công!");
      navigate("/");
    } catch (error) {
      message.error("Mã OTP không chính xác hoặc đã hết hạn");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <LoginWithPass />
    </div>
  );
}
