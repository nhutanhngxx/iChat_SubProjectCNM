import React, { useState } from 'react';
import { Row, Col, Typography, Button, Input, message } from 'antd';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const navigate = useNavigate();

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response) => {
          console.log('reCAPTCHA solved:', response);
        },
      });
    }
  };

  const handleSendOtp = async () => {
    if (!phoneNumber) {
      message.error('Vui lòng nhập số điện thoại');
      return;
    }
    setupRecaptcha();
    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      message.success('Mã OTP đã được gửi');
    } catch (error) {
      console.error(error);
      message.error('Gửi OTP thất bại');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || !confirmationResult) {
      message.error('Vui lòng nhập mã OTP');
      return;
    }
    try {
      await confirmationResult.confirm(otp);
      message.success('Đăng nhập thành công');
      navigate('/');
    } catch (error) {
      console.error(error);
      message.error('Mã OTP không hợp lệ');
    }
  };

  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log({user});
    }
  });

  return (
    <div>
      <Row justify={'center'} style={{ height: 800 }}>
        <Col span={8}>
          <Title style={{ textAlign: 'center' }} level={3}>IChat</Title>
          <Input
            placeholder='Nhập số điện thoại'
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            style={{ marginBottom: 10 }}
          />
          <Button style={{ width: '100%', marginBottom: 5 }} onClick={handleSendOtp}>
            Gửi mã OTP
          </Button>
          <Input
            placeholder='Nhập mã OTP'
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={{ marginBottom: 10 }}
          />
          <Button style={{ width: '100%', marginBottom: 5 }} onClick={handleVerifyOtp}>
            Xác nhận OTP
          </Button>
          <div id='recaptcha-container'></div>
        </Col>
      </Row>
    </div>
  );
}
