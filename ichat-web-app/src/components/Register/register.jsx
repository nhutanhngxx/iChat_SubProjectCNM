import React, { useState, useRef, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./register.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { useDispatch } from "react-redux";
import { checkExistedPhone, sendOtpFirebase, verifyOtpFirebase, registerUser } from "../../redux/slices/authSlice";
import { auth } from "../../firebase/config";
import { RecaptchaVerifier } from "firebase/auth"; // Import directly from firebase/auth

const RegisterModal = ({ visible, onClose, onRegister }) => {
    const dispatch = useDispatch();
    const [step, setStep] = useState(1);
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [confirmShowPassword, setConfirmShowPassword] = useState(false);
    const [fullName, setFullName] = useState("");
    const [dob, setDob] = useState("");
    const [gender, setGender] = useState("");
    const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
    const otpRefs = useRef([]);
    const [countryCode, setCountryCode] = useState("VN");
    const [countdown, setCountdown] = useState(60);
    const timerRef = useRef(null);
    const recaptchaVerifierRef = useRef(null);
    const initializeRecaptcha = () => {
        try {
            // Clear previous instance if exists
            if (window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier.clear();
                } catch (err) {
                    console.error("Error clearing reCAPTCHA:", err);
                }
                window.recaptchaVerifier = null;
            }

            // Import directly where needed - this is key to fixing the issue
            const { RecaptchaVerifier } = require("firebase/auth");

            // Create new instance with auth as third parameter
            window.recaptchaVerifier = new RecaptchaVerifier(
                'recaptcha-container',
                {
                    size: 'invisible',
                    callback: () => console.log('reCAPTCHA verified')
                },
                auth // Make sure auth is properly imported at the top
            );

            recaptchaVerifierRef.current = window.recaptchaVerifier;
            // console.log('RecaptchaVerifier initialized successfully');
        } catch (error) {
            console.error('Error initializing RecaptchaVerifier:', error);
        }
    };

    // Đếm ngược cho OTP
    const startCountdown = () => {
        setCountdown(60);
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

    const stopCountdown = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setCountdown(0);
    };

    // Xử lý OTP input
    const handleOtpChange = (e, index) => {
        const value = e.target.value;
        if (!/^\d?$/.test(value)) return;

        const newOtp = [...otpValues];
        if (value === "") {
            newOtp[index] = "";
            setOtpValues(newOtp);
            setOtp(newOtp.join(""));
            if (index > 0) {
                otpRefs.current[index - 1]?.focus();
            }
        } else {
            newOtp[index] = value;
            setOtpValues(newOtp);
            setOtp(newOtp.join(""));
            if (index < newOtp.length - 1) {
                otpRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleOtpClick = (index) => {
        if (!otpValues[0] && index !== 0) {
            otpRefs.current[0].focus();
        }
    };

    // Kiểm tra số điện thoại đã tồn tại
    const handleCheckPhone = async (phoneNumber) => {
        const resultAction = await dispatch(checkExistedPhone(phoneNumber));
        if (checkExistedPhone.fulfilled.match(resultAction)) {
            // console.log("Số điện thoại hợp lệ, chưa tồn tại.");
            return true;
        } else {
            alert(resultAction.payload);
            return false;
        }
    };

    // Xử lý bước tiếp theo
    const handleNextStep = async () => {
        if (step === 1) {
            const phoneRegex = /^[0-9]{9,11}$/;
            const trimmedPhone = String(phone).trim();

            if (!phoneRegex.test(trimmedPhone)) {
                alert("Số điện thoại không hợp lệ");
                return;
            }

            const parsedNumber = parsePhoneNumberFromString(phone, countryCode);
            if (!parsedNumber || !parsedNumber.isValid()) {
                alert("Số điện thoại không hợp lệ với quốc gia đã chọn!");
                return;
            }

            try {
                // Kiểm tra số điện thoại
                const isPhoneValid = await handleCheckPhone(parsedNumber.number);
                if (!isPhoneValid) return;

                const formattedNumber = parsedNumber.format("E.164");
                // console.log("Sending OTP to:", formattedNumber);

                // Đảm bảo reCAPTCHA đã sẵn sàng
                if (!recaptchaVerifierRef.current) {
                    initializeRecaptcha();
                }

                // Gửi OTP
                const resultOtp = await dispatch(
                    sendOtpFirebase({
                        phoneNumber: formattedNumber,
                        recaptchaVerifier: recaptchaVerifierRef.current,
                    })
                );

                if (sendOtpFirebase.fulfilled.match(resultOtp)) {
                    setStep(2);
                    startCountdown();
                    alert("Mã OTP đã được gửi tới số điện thoại!");
                } else {
                    console.error("Không thể gửi mã OTP:", resultOtp.payload);
                    alert("Không thể gửi mã OTP: " + resultOtp.payload);
                }
            } catch (error) {
                console.error("Lỗi khi gửi OTP:", error);
                alert("Gửi OTP thất bại, vui lòng thử lại.");
            }
            return;
        }

        if (step === 2) {
            if (otp.length !== 6) {
                alert("Vui lòng nhập đủ 6 số OTP");
                return;
            }

            const verifyResult = await dispatch(verifyOtpFirebase(otp));
            if (verifyOtpFirebase.fulfilled.match(verifyResult)) {
                // console.log("OTP xác thực thành công");
                setStep(3);
                stopCountdown();
            } else {
                alert(verifyResult.payload || "OTP không đúng");
            }
            return;
        }

        if (step === 3) {
            const passRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/;
            if (!passRegex.test(password)) {
                alert("Mật khẩu phải có ít nhất 6 ký tự, gồm ít nhất 1 chữ hoa và 1 số");
                return;
            }

            if (password !== confirmPassword) {
                alert("Mật khẩu nhập lại không khớp");
                return;
            }

            setStep(4);
            return;
        }

        if (step === 4) {
            if (!fullName || !dob || !gender) {
                alert("Vui lòng điền đầy đủ thông tin");
                return;
            }
            const mappedGender =
                gender === "Nam" ? "Male" : gender === "Nữ" ? "Female" : "Other";
            const parsedNumber = parsePhoneNumberFromString(phone, countryCode);
            const result = await dispatch(
                registerUser({
                    phone: parsedNumber.number,
                    password,
                    fullName,
                    dob,
                    gender: mappedGender,
                })
            );

            if (registerUser.fulfilled.match(result)) {
                alert("Đăng ký thành công!");
                onClose();
            } else {
                alert(result.payload || "Đăng ký thất bại");
            }
        }
    };

    // Xử lý quay lại bước trước
    const handlePreviousStep = () => {
        if (step > 1) {
            setStep((prev) => prev - 1);
            if (step === 2) {
                stopCountdown();
            }
        }
    };

    // Khởi tạo reCAPTCHA và dọn dẹp
    useEffect(() => {
        if (!document.getElementById("recaptcha-container")) {
            const recaptchaDiv = document.createElement("div");
            recaptchaDiv.id = "recaptcha-container";
            document.body.appendChild(recaptchaDiv);
        }

        initializeRecaptcha();

        return () => {
            stopCountdown();
            if (recaptchaVerifierRef.current) {
                try {
                    recaptchaVerifierRef.current.clear();
                } catch (e) {
                    console.error("Error clearing reCAPTCHA:", e);
                }
                recaptchaVerifierRef.current = null;
                window.recaptchaVerifier = null;
            }
            const recaptchaContainer = document.getElementById("recaptcha-container");
            if (recaptchaContainer) {
                recaptchaContainer.remove();
            }
        };
    }, []);


    if (!visible) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div>
                    <img
                        style={{ width: "150px", height: "auto" }}
                        src="https://i.ibb.co/TGJ0mZm/logo-ichat-removebg.png"
                        alt="logo-ichat"
                    />
                    <h2>Đăng Ký Tài Khoản</h2>
                </div>

                {/* B1 - Nhập SĐT */}
                {step === 1 && (
                    <>
                        <div style={{ display: "flex", gap: "5px", borderBottom: "1px solid #ccc", padding: "5px", borderRadius: "5px" }}>
                            <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} style={{ width: "100px" }}>
                                <option value="VN">+84 (VN)</option>
                                <option value="US">+1 (US)</option>
                                <option value="KR">+82 (KR)</option>
                                <option value="JP">+81 (JP)</option>
                                <option value="CN">+86 (CN)</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Số điện thoại"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                maxLength={15}
                            />
                        </div>
                        <div id="recaptcha-container"></div>
                        <button className="handleNextStep" onClick={handleNextStep}>
                            Gửi mã OTP
                        </button>
                    </>
                )}

                {/* B2 - Nhập OTP */}
                {step === 2 && (
                    <>
                        <div className="otp-container">
                            {[0, 1, 2, 3, 4, 5].map((_, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (otpRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={otpValues[index]}
                                    onChange={(e) => handleOtpChange(e, index)}
                                    onClick={() => handleOtpClick(index)}
                                    className="otp-input"
                                />
                            ))}
                        </div>
                        {countdown > 0 ? (
                            <p style={{ textAlign: "center" }}>Bạn có thể gửi lại mã sau: {countdown}s</p>
                        ) : (
                            <button
                                className="resend-otp"
                                onClick={async () => {
                                    try {
                                        const parsedNumber = parsePhoneNumberFromString(phone, countryCode);
                                        if (parsedNumber && parsedNumber.isValid()) {
                                            const formattedNumber = parsedNumber.format("E.164");
                                            if (!recaptchaVerifierRef.current) {
                                                initializeRecaptcha();
                                            }
                                            const resultOtp = await dispatch(
                                                sendOtpFirebase({
                                                    phoneNumber: formattedNumber,
                                                    recaptchaVerifier: recaptchaVerifierRef.current,
                                                })
                                            );
                                            if (sendOtpFirebase.fulfilled.match(resultOtp)) {
                                                startCountdown();
                                                alert("Đã gửi lại mã OTP thành công!");
                                            } else {
                                                alert("Không thể gửi lại mã OTP: " + resultOtp.payload);
                                            }
                                        }
                                    } catch (error) {
                                        console.error("Error resending OTP:", error);
                                        alert("Lỗi khi gửi lại mã OTP");
                                    }
                                }}
                                style={{ width: "100%" }}
                            >
                                Gửi lại mã OTP
                            </button>
                        )}
                        <button className="handleNextStep" onClick={handleNextStep}>
                            Xác nhận OTP
                        </button>
                    </>
                )}

                {/* B3 - Nhập mật khẩu */}
                {step === 3 && (
                    <>
                        <div style={{ position: "relative" }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ paddingRight: "40px" }}
                            />
                            <span
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: "absolute",
                                    right: "10px",
                                    top: "19%",
                                    transform: "translateY(-50%)",
                                    cursor: "pointer",
                                }}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                            <input
                                type={confirmShowPassword ? "text" : "password"}
                                placeholder="Nhập lại mật khẩu"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={{ paddingRight: "40px" }}
                            />
                            <span
                                onClick={() => setConfirmShowPassword(!confirmShowPassword)}
                                style={{
                                    position: "absolute",
                                    right: "10px",
                                    top: "68%",
                                    transform: "translateY(-50%)",
                                    cursor: "pointer",
                                }}
                            >
                                {confirmShowPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        <button className="handleNextStep" onClick={handleNextStep}>
                            Tiếp tục
                        </button>
                    </>
                )}

                {/* B4 - Nhập thông tin người dùng */}
                {step === 4 && (
                    <>
                        <input
                            type="text"
                            placeholder="Họ và tên"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                        <input
                            type="date"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                        />
                        <select value={gender} onChange={(e) => setGender(e.target.value)}>
                            <option value="">-- Chọn giới tính --</option>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                        </select>
                        <button className="handleNextStep" onClick={handleNextStep}>
                            Hoàn tất đăng ký
                        </button>
                    </>
                )}

                <div className="modal-buttons">
                    {step > 1 && (
                        <button className="back back-modal" onClick={handlePreviousStep}>
                            Quay lại
                        </button>
                    )}
                    <button className="cancel cancel-modal" onClick={onClose}>
                        X
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegisterModal;