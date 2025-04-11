import React, { useState, useRef } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./register.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { useDispatch, useSelector } from "react-redux";
import { checkExistedPhone } from "../../redux/slices/authSlice";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "../../firebase/config"; // đường dẫn tới firebase.js
import { PhoneAuthProvider, signInWithCredential } from "firebase/auth";



const RegisterModal = ({ visible, onClose, onRegister }) => {
    const dispatch = useDispatch();

    const [step, setStep] = useState(1);

    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [fullName, setFullName] = useState("");
    const [dob, setDob] = useState("");
    const [gender, setGender] = useState("");
    // OTP
    const [otpValues, setOtpValues] = useState(["", "", "", ""]);
    const otpRefs = useRef([]);
    // Mã quốc gia
    const [countryCode, setCountryCode] = useState("VN");
    // state lưu mã xác thực
    const [verificationId, setVerificationId] = useState(null);
    //Timer đếm ngược
    const [countdown, setCountdown] = useState(60);
    const timerRef = useRef(null);

    //Hàm gửi OTP qua Firebase
    const sendOtpWithFirebase = async (fullPhoneNumber) => {
        try {
            // Check if recaptcha-container exists
            if (!document.getElementById('recaptcha-container')) {
                console.error("recaptcha-container not found in DOM");
                alert("Error: reCAPTCHA container not found. Please refresh the page.");
                return;
            }
            console.log("phoneNumber to send get otp: ", fullPhoneNumber);

            // Reset reCAPTCHA if it exists
            if (window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier.clear();
                } catch (e) {
                    console.error("Error clearing existing reCAPTCHA:", e);
                }
                window.recaptchaVerifier = null;
            }

            // Make sure auth is properly initialized
            if (!auth || !auth.app) {
                console.error("Firebase auth is not properly initialized");
                alert("Authentication service not available. Please try again later.");
                return;
            }

            console.log("Creating reCAPTCHA verifier...");

            // Create new reCAPTCHA verifier with proper structure
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible',
                callback: () => {
                    console.log("reCAPTCHA verified");
                }
            });

            const appVerifier = window.recaptchaVerifier;
            console.log("Sending OTP to:", fullPhoneNumber);

            const confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier);
            window.confirmationResult = confirmationResult;

            setVerificationId(confirmationResult.verificationId);
            setStep(2);
            startCountdown();

            alert("Mã OTP đã được gửi tới số điện thoại!");
        } catch (error) {
            console.error("Lỗi gửi OTP:", error);

            if (error.code === 'auth/invalid-api-key') {
                alert("Lỗi cấu hình Firebase. Vui lòng liên hệ quản trị viên.");
            } else if (error.code === 'auth/invalid-phone-number') {
                alert("Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.");
            } else {
                alert(`Không thể gửi OTP: ${error.message || "Hãy thử lại."}`);
            }

            if (window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier.clear();
                } catch (e) {
                    console.error("Error clearing reCAPTCHA after main error:", e);
                }
                window.recaptchaVerifier = null;
            }
        }
    };
    // Hàm xác thực OTP
    const verifyOtp = async () => {
        try {
            // Ensure OTP is proper length
            if (otp.length !== 6) {
                alert("Vui lòng nhập đủ 6 số OTP");
                return false;
            }

            console.log("Verifying OTP:", otp);
            console.log("With verification ID:", verificationId);

            const credential = PhoneAuthProvider.credential(verificationId, otp);
            await signInWithCredential(auth, credential);

            alert("Xác thực OTP thành công!");
            setStep(3); // Chuyển sang bước tiếp theo
            return true;
        } catch (error) {
            console.error("Xác thực OTP thất bại:", error);

            if (error.code === 'auth/invalid-verification-code') {
                alert("Mã OTP không đúng. Vui lòng kiểm tra lại.");
            } else if (error.code === 'auth/code-expired') {
                alert("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.");
            } else {
                alert("Mã OTP không đúng hoặc đã hết hạn.");
            }
            return false;
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
    // Hàm xử lý khi nhập OTP
    const handleOtpChange = (e, index) => {
        const value = e.target.value;

        if (!/^\d?$/.test(value)) return;

        const newOtp = [...otpValues];

        if (value === "") {
            // Nếu đang xoá
            const hasValueAfter = newOtp.slice(index + 1).some((v) => v !== "");

            // Xoá ô hiện tại
            newOtp[index] = "";

            if (hasValueAfter) {
                // Nếu sau ô này vẫn còn số => xoá luôn những số sau
                for (let i = index + 1; i < newOtp.length; i++) {
                    newOtp[i] = "";
                }
            }

            setOtpValues(newOtp);
            setOtp(newOtp.join(""));

            // Dù còn hay không, đều focus về ô trước
            if (index > 0) {
                otpRefs.current[index - 1]?.focus();
            }
        } else {
            // Nếu nhập số thì cập nhật giá trị
            newOtp[index] = value;
            setOtpValues(newOtp);
            setOtp(newOtp.join(""));

            // Nếu không phải ô cuối thì focus tiếp
            if (index < newOtp.length - 1) {
                otpRefs.current[index + 1]?.focus();
            }
        }
    };
    // Hàm xử lý khi click vào ô OTP
    const handleOtpClick = (index) => {
        // Nếu ô đầu tiên chưa nhập thì luôn focus ô đầu tiên
        if (!otpValues[0] && index !== 0) {
            otpRefs.current[0].focus();
        }
    };

    // Check xem số điện thoại đã tồn tại trong DB chưa
    const handleCheckPhone = async (phone) => {
        const resultAction = await dispatch(checkExistedPhone(phone));
        if (checkExistedPhone.fulfilled.match(resultAction)) {

            console.log("Số điện thoại hợp lệ, chưa tồn tại.");
        } else if (checkExistedPhone.rejected.match(resultAction)) {
            console.log(resultAction.payload); // Có thể là "Số điện thoại này đã được đăng ký."
            alert(resultAction.payload); // Hiển thị thông báo lỗi

        }
    };
    // Hàm xử lý bước tiếp theo
    const handleNextStep = async () => {
        if (step === 1) {
            const phoneRegex = /^[0-9]{9,11}$/;
            if (!phoneRegex.test(phone)) {
                alert("Số điện thoại không hợp lệ");
                return;
            }
            // TODO: check DB + gửi OTP
            const parsedNumber = parsePhoneNumberFromString(phone, countryCode);

            if (!parsedNumber || !parsedNumber.isValid()) {
                alert("Số điện thoại không hợp lệ với quốc gia đã chọn!");
                return;
            }

            // Nếu hợp lệ: gửi OTP hoặc lưu số đầy đủ
            console.log("Số đầy đủ:", parsedNumber.number); // e.g. +84987654321
            // Gọi hàm kiểm tra số điện thoại đã tồn tại trong DB
            await handleCheckPhone(parsedNumber.number)
            // Gọi API gửi OTP ở đây
            // await handleCheckPhone(parsedNumber.number);
            await sendOtpWithFirebase(parsedNumber.number);
            // setStep(2);
            stopCountdown(); // Dừng đếm ngược nếu có
            return;


        }

        if (step === 2 && otp.length !== 6) {
            const verified = await verifyOtp();
            if (!verified) return;
            // Don't need to call setStep here as verifyOtp already does that if successful
            return;
        }

        if (step === 3) {
            const passRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
            if (!passRegex.test(password)) {
                alert("Mật khẩu phải có ít nhất 6 ký tự, gồm chữ và số");
                return;
            }
        }

        if (step === 4) {
            if (!fullName || !dob || !gender) {
                alert("Vui lòng điền đầy đủ thông tin");
                return;
            }

            const tempToken = "TEMP_TOKEN"; // Tạm hardcode
            onRegister({ phone, password, fullName, dob, gender, tempToken });
            onClose(); // Đóng modal sau đăng ký
        }

        setStep((prev) => prev + 1);
    };

    const handlePreviousStep = () => {
        if (step > 1) {
            setStep((prev) => prev - 1);
        }
    };
    React.useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    if (!visible) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div>
                    <img style={{
                        width: "150px",
                        height: "auto"
                    }} src="https://i.ibb.co/TGJ0mZm/logo-ichat-removebg.png" alt="logo-ichat" />
                    <h2>Đăng Ký Tài Khoản</h2>
                </div>

                {/* B1 - Nhập SĐT */}
                {step === 1 && (
                    <>
                        <div style={{ display: "flex", gap: "5px", borderBottom: "1px solid #ccc", padding: "5px", borderRadius: "5px" }}>
                            {/* Chọn quốc gia */}
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
                        <button className="handleNextStep" onClick={handleNextStep}>Gửi mã OTP</button>
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
                        {/* Đếm ngược hoặc nút gửi lại mã */}
                        {countdown > 0 ? (
                            <p style={{ textAlign: 'center' }}>Bạn có thể gửi lại mã sau: {countdown}s</p>
                        ) : (
                            <button
                                className="resend-otp"
                                onClick={async () => {
                                    const parsedNumber = parsePhoneNumberFromString(phone, countryCode);
                                    if (parsedNumber && parsedNumber.isValid()) {
                                        await sendOtpWithFirebase(parsedNumber.number);
                                    }
                                }}
                                style={{ width: "100%" }}
                            >
                                Gửi lại mã OTP
                            </button>
                        )}
                        <button className="handleNextStep" onClick={handleNextStep}>Xác nhận OTP</button>
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
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    cursor: "pointer",
                                }}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        <button className="handleNextStep" onClick={handleNextStep}>Tiếp tục</button>
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
                        <button className="handleNextStep" onClick={handleNextStep}>Hoàn tất đăng ký</button>
                    </>
                )}

                <div className="modal-buttons">
                    {step > 1 && (
                        <button className="back back-modal" onClick={handlePreviousStep}>
                            Quay lại
                        </button>
                    )}
                    <button className="cancel cancel-modal" onClick={onClose} >
                        X
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegisterModal;