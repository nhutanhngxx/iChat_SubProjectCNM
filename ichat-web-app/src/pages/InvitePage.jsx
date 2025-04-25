import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Result, Button, Spin, Card, Avatar, Divider } from 'antd';
import { joinGroupByInvitation } from '../redux/slices/groupSlice';
import { TeamOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const InvitePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [groupInfo, setGroupInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  const user = useSelector(state => state.auth.user);
  const invitationStatus = useSelector(state => state.groups.invitationStatus);
  
  useEffect(() => {
    // Kiểm tra đăng nhập
    if (!user || !user.id) {
      // Lưu token vào localStorage để xử lý sau khi đăng nhập
      localStorage.setItem('pendingInvite', token);
      navigate('/login', { state: { from: `/invite/${token}` }});
      return;
    }
    
    // Xác thực và tham gia nhóm
    dispatch(joinGroupByInvitation({
      token,
      userId: user.id
    }))
    .unwrap()
    .then(data => {
      setStatus('success');
      setGroupInfo(data);
    })
    .catch(err => {
      setStatus('error');
      setErrorMessage(err || 'Không thể tham gia nhóm');
    });
  }, [token, user, dispatch, navigate]);
  
  // Xử lý khi người dùng nhấn nút chuyển về trang chính
  const handleGoToChat = () => {
    if (groupInfo) {
      // Format nhóm để truyền vào state
      const formattedGroup = {
        id: groupInfo._id,
        name: groupInfo.name,
        avatar_path: groupInfo.avatar || "",
        chat_type: "group",
        admin_id: groupInfo.admin_id,
        receiver_id: groupInfo._id,
      };
      
      // Lưu thông tin nhóm vào localStorage để có thể mở trong ChatWindow
      localStorage.setItem("selectedFriend", JSON.stringify(formattedGroup));
      
      // Chuyển hướng về trang chính với state để mở chat
      navigate('/home', { state: { activateChat: true, selectedFriend: formattedGroup }});
    } else {
      navigate('/home');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Card style={{ width: 400, textAlign: 'center', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
        {status === 'verifying' && (
          <div style={{ padding: '30px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16 }}>Đang xác thực lời mời...</p>
          </div>
        )}
        
        {status === 'success' && groupInfo && (
          <Result
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            title="Tham gia nhóm thành công!"
            subTitle={
              <div style={{ padding: '10px 0' }}>
                <Avatar
                  src={groupInfo.avatar}
                  size={64}
                  icon={<TeamOutlined />}
                />
                <h2 style={{ margin: '10px 0' }}>{groupInfo.name}</h2>
              </div>
            }
            extra={
              <Button type="primary" onClick={handleGoToChat}>
                Đi đến nhóm chat
              </Button>
            }
          />
        )}
        
        {status === 'error' && (
          <Result
            icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
            title="Không thể tham gia nhóm"
            subTitle={errorMessage}
            extra={
              <Button type="primary" onClick={() => navigate('/home')}>
                Về trang chính
              </Button>
            }
          />
        )}
      </Card>
    </div>
  );
};

export default InvitePage;