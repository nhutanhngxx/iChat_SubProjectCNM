// src/components/Login/LoginWithQR.jsx
import React, { useEffect, useState } from "react";
// import QRCode from "qrcode.react";
import { QRCodeSVG } from 'qrcode.react';
import socket from "../services/socket";
import axios from "../services/api";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { authenticateWithToken } from "../../redux/slices/authSlice";


export default function LoginWithQR() {
  const [sessionId, setSessionId] = useState(null);
  const [expired, setExpired] = useState(false);
  const [userInfo, setUserInfo] = useState(null); // Thêm state để lưu thông tin người dùng
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Gọi API để tạo session QR
    const fetchSession = async () => {
      try {
        const res = await axios.get(`auth/qr-session`);
        setSessionId(res.data.sessionId);
        console.log("Tạo session QR với sessionId:", res.data.sessionId);


        // Tự động hết hạn sau 2 phút
        setTimeout(() => {
          setExpired(true);
        }, 2 * 60 * 1000);
      } catch (err) {
        console.error("Lỗi khi tạo session QR:", err);
      }
    };

    fetchSession();
  }, []);

  // useEffect(() => {
  //   if (!sessionId) return;

  //   socket.emit("join-session", sessionId); // Tham gia room với sessionId

  //   socket.on("qr-login-success", ({ sessionId: incomingId, token }) => {
  //     if (incomingId === sessionId) {
  //       localStorage.setItem("token", token); // lưu token
  //       navigate("/home"); // chuyển trang
  //     }
  //   });

  //   return () => {
  //     socket.off("qr-login-success");
  //   };
  // }, [sessionId, navigate]);
  useEffect(() => {
    if (!sessionId) return;

    socket.emit("register-session", sessionId);
    console.log("✅ Đã đăng ký socket session:", sessionId);

    socket.emit("join-session", sessionId);

    socket.on("qr-login-success", ({ userInfo }) => {
      setUserInfo(userInfo); // Hiển thị xác nhận
    });

    return () => {
      socket.off("qr-login-success");
    };
  }, [sessionId]);

  const handleConfirmLogin = async () => {
    console.log("👉 Đã nhấn nút xác nhận"); // THÊM LOG NÀY
    try {
      console.log("Gửi request xác nhận với sessionId:", sessionId);
      const res = await axios.post(`auth/confirm-login`, { sessionId });
      console.log("Phản hồi từ confirm-login:", res.data);

      console.log("Đã xác nhận đăng nhập:", res.data); // THÊM LOG NÀY
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        console.log("Nhận token:", res.data.token);
        // gọi hàm đăng nhập 
        await dispatch(authenticateWithToken());
        navigate("/home");
      } else {
        console.warn("Không nhận được token từ confirm-login:", res.data);
        alert("Đăng nhập thất bại!");
      }
    } catch (err) {
      console.error("Lỗi khi xác nhận đăng nhập:", err);
      if (err.response) {
        console.error("Server trả về lỗi:", err.response.data);
        alert("Lỗi: " + JSON.stringify(err.response.data));
      } else {
        alert("Xác nhận thất bại! " + err.message);
      }

    }
  };


  if (expired) return <p style={{ textAlign: "center" }}>Mã QR đã hết hạn. Vui lòng thử lại.</p>;

  return (
    <div style={{ textAlign: "center", justifyItems: "center", marginTop: "20px", }}>
      {/* {sessionId ? (
        <>
          <div style={{ justifyItems: "center", border: "1px solid #ccc", padding: "20px 10px", borderRadius: "10px" }}>
            <QRCodeSVG value={JSON.stringify({ sessionId })} size={220} />
          </div>
          return ( */}
      <div>
        {userInfo ? (
          <div style={{ justifyItems: "center", border: "1px solid #ccc", padding: "20px 50px", borderRadius: "10px" }}>
            <h2 style={{ marginBottom: "10px", fontWeight: 'bold' }}>Xác nhận đăng nhập</h2>
            <img src={userInfo.avatar} alt="Avatar" style={{ width: "100px", height: "100px", borderRadius: "50%" }} />
            <p style={{ padding: "10px" }}>{userInfo.name}</p>
            <button onClick={handleConfirmLogin}
              style={{
                backgroundColor: "none",
                padding: "10px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "16px",
                color: "violet"
              }}
            >Xác nhận đăng nhập</button>
          </div>
        ) : (
          <>
            <QRCodeSVG value={JSON.stringify({ sessionId })} size={220} />
            <p>Quét mã QR bằng mobile</p>
          </>
        )}
      </div>
      {/* );

          <p style={{ marginTop: "20px" }}>Quét mã QR bằng ứng dụng iChat Mobile để đăng nhập</p> */}
      {/* </> */}
      {/* ) : (
        <p style={{ textAlign: "center" }}>Đang tạo mã QR...</p>
      )} */}
    </div >
  );
}
