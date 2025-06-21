import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../services/auth_context';
import { getDollInfo, unfollow, check_following, follow} from '../services/api';
import PostList from '../components/load_post';
import { MdModeEditOutline } from "react-icons/md";
import EditDoll from '../components/edit_doll';
import { RiUserUnfollowFill } from "react-icons/ri";
import { IoPersonAdd } from "react-icons/io5";
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  CardHeader, 
  CardBody, 
  CardImg, 
  ListGroup, 
  ListGroupItem,
  CardTitle,
  Spinner
} from 'reactstrap';
import doll_img from '../assets/windy.jpg'; // 預設圖片，可以作為載入中的替代

export default function DollPage() {
  const { doll_id } = useParams(); // 從 URL 獲取娃娃 ID
  const auth_context = useContext(AuthContext);
  
  const [doll, setDoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // 監聽視窗大小變化
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 檢查是否已關注該娃娃
  useEffect(() => {
    const checkFollowingStatus = async () => {
      if (!auth_context.currentDollId || !doll_id) return;
      try {
        const response = await check_following(auth_context.currentDollId, doll_id);
        setIsFollowing(response.data.is_following);
      } catch (err) {
        console.error('檢查關注狀態失敗:', err);
        setError('無法檢查關注狀態');
      }
    };
    checkFollowingStatus();
  }, [auth_context.currentDollId, doll_id]);

  // 關注功能
  const handleFollow = async () => {
    const followData = {
      from_doll_id: auth_context.currentDollId,
      to_doll_id: dollData.id
    };
    try {
      await follow(followData);
      setIsFollowing(true);
    } catch (err) {
      console.error('關注失敗:', err);
      setError('關注失敗，請稍後再試');
    }
  };

  // 切換編輯模態框
  const toggleEditModal = () => {
    setIsEditModalOpen(!isEditModalOpen);
  };

  // 取消關注功能
  const handleUnfollow = async () => {
    const isConfirmed = window.confirm('你確定要取消關注嗎？');
    
    if (isConfirmed) {
      try {
        const unfollowData = {
          from_doll_id: auth_context.currentDollId,
          to_doll_id: dollData.id
        };
        
        await unfollow(unfollowData);
        setIsFollowing(false);
      } catch (err) {
        console.error('取消關注失敗:', err);
      }
    }
  };
  
  // 獲取娃娃資料
  useEffect(() => {
    const fetchDollData = async () => {
      try {
        setLoading(true);
        const res = await getDollInfo(doll_id || auth_context.currentDollId);
        setDoll(res.data);
      } catch (err) {
        console.error('獲取娃娃數據失敗:', err);
        if (err.response) {
          const data = err.response.data;
          let message = '';
          if (typeof data === 'object' && data !== null) {
            if (data.detail) {
              message = data.detail;
            } else if (data.non_field_errors) {
              message = data.non_field_errors.join(', ');
            } else {
              message = Object.entries(data)
                .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                .join('\n');
            }
          }
          setError(message);
        } else {
          setError('無法連接到伺服器');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchDollData();
  }, [doll_id, auth_context.currentDollId]);
  
  // 顯示載入中狀態
  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner color="primary" />
      </Container>
    );
  }
  
  // 顯示錯誤
  if (error) {
    return (
      <Container className="mt-5">
        <Card className="text-center text-danger">
          <CardBody>
            <h4>載入失敗</h4>
            <p>{error}</p>
          </CardBody>
        </Card>
      </Container>
    );
  }
  
  // 使用後端數據或預設數據
  const dollData = doll || {
    id: 'doll_id',
    name: 'Unknown',
    avatar_image: doll_img,
    username: '-',
    birthday: '-',
    bio: '-',
    tags: '-'
  };
  
  // 渲染電腦版畫面
  const renderDesktopVersion = () => {
    return (
      <Container className="mt-5" style={{ paddingTop: 50 }}>
        <Row>
          <Col 
            md={4}
            style={{ 
              position: 'sticky',    
              top: 100,               
              alignSelf: 'flex-start', 
              height: 'fit-content'  
            }}>
            <Card className="mb-4">
              <CardHeader className="d-flex align-items-center justify-content-between">
                <h2 className="mb-0">{dollData.id}</h2>
                { auth_context.currentDollId === dollData.id &&
                  <MdModeEditOutline 
                    style={{ cursor: 'pointer', fontSize: '1.25rem' }} 
                    onClick={toggleEditModal}  
                  />
                }
                { isFollowing && auth_context.currentDollId !== dollData.id &&
                  <RiUserUnfollowFill
                    style={{ cursor: 'pointer', fontSize: '1.25rem' }} 
                    onClick={handleUnfollow}
                  />
                }
                { !isFollowing && auth_context.currentDollId !== dollData.id &&
                  <IoPersonAdd
                    style={{ cursor: 'pointer', fontSize: '1.25rem' }} 
                    onClick={handleFollow}
                  />
                }
              </CardHeader>
              <CardBody>
                <CardImg 
                  src={typeof dollData.avatar_image === 'string' 
                    ? dollData.avatar_image 
                    : dollData.avatar_image instanceof File 
                      ? URL.createObjectURL(dollData.avatar_image)
                      : doll_img} 
                  alt={dollData.name} 
                  onError={(e) => {
                    console.log('圖片載入失敗', e);
                    e.target.src = doll_img;
                  }}
                  className="mb-3"
                  style={{
                    aspectRatio: '1 / 1',
                    borderRadius: '10px',
                    objectFit: 'cover'
                  }}
                />

                <ListGroup flush>
                  <ListGroupItem>
                    <strong>User:</strong> {dollData.username}
                  </ListGroupItem>
                  <ListGroupItem>
                    <strong>Name:</strong> {dollData.name}
                  </ListGroupItem>
                  <ListGroupItem>
                    <strong>Birthday:</strong> {dollData.birthday}
                  </ListGroupItem>
                  <ListGroupItem>
                    <strong>Bio:</strong> {dollData.description}
                  </ListGroupItem>
                  <ListGroupItem>
                    <strong>Tag:</strong> {
                      Array.isArray(dollData.tags)
                        ? dollData.tags.map(tag => tag.name).join(', ')
                        : dollData.tags
                    }
                  </ListGroupItem>
                </ListGroup>
              </CardBody>
            </Card>
          </Col>
            
          <Col md={8}>
            <Card>
              <CardHeader>
                <CardTitle className="text-center h4">Recently Posts</CardTitle>
              </CardHeader>
              <CardBody>
                <PostList mode="profile" profileDollId={dollData.id} />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  };
  
  // 渲染手機版畫面
  const renderMobileVersion = () => {
    return (
      <div style={{ paddingTop: 60, paddingBottom: 70 }}> {/* 為頂部導航欄和底部導航欄留出空間 */}
        {/* 頂部個人資訊區域 */}
        <div style={{
          padding: '10px 15px',
          backgroundColor: 'white',
          marginBottom: '10px'
        }}>
          {/* 頭像和基本信息 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <img 
              src={typeof dollData.avatar_image === 'string' 
                ? dollData.avatar_image 
                : dollData.avatar_image instanceof File 
                  ? URL.createObjectURL(dollData.avatar_image)
                  : doll_img}
              alt={dollData.name}
              onError={(e) => { e.target.src = doll_img; }}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                objectFit: 'cover',
                marginRight: '15px'
              }}
            />
            
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '5px'
              }}>
                <h3 style={{ margin: 0 }}>{dollData.id}</h3>
                
                <div>
                  {auth_context.currentDollId === dollData.id ? (
                    <button
                      onClick={toggleEditModal}
                      style={{
                        background: '#f0f0f0',
                        border: 'none',
                        borderRadius: '5px',
                        padding: '5px 10px',
                        fontSize: '14px'
                      }}
                    >
                      編輯資料
                    </button>
                  ) : isFollowing ? (
                    <button
                      onClick={handleUnfollow}
                      style={{
                        background: '#f0f0f0',
                        border: 'none',
                        borderRadius: '5px',
                        padding: '5px 10px',
                        fontSize: '14px'
                      }}
                    >
                      取消關注
                    </button>
                  ) : (
                    <button
                      onClick={handleFollow}
                      style={{
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        padding: '5px 10px',
                        fontSize: '14px'
                      }}
                    >
                      關注
                    </button>
                  )}
                </div>
              </div>
              
              <p style={{ margin: '3px 0', fontSize: '15px' }}>
                <strong>{dollData.name}</strong>
              </p>
              
              <p style={{ margin: '3px 0', fontSize: '13px', color: '#666' }}>
                {dollData.description || '沒有個人簡介'}
              </p>
            </div>
          </div>
          
          {/* 其他簡明資訊 */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            fontSize: '13px',
            color: '#666'
          }}>
            <div style={{ marginRight: '15px', marginBottom: '5px' }}>
              <strong>User:</strong> {dollData.username}
            </div>
            <div style={{ marginRight: '15px', marginBottom: '5px' }}>
              <strong>Birthday:</strong> {dollData.birthday}
            </div>
            <div style={{ marginBottom: '5px' }}>
              <strong>Tag:</strong> {
                Array.isArray(dollData.tags)
                  ? dollData.tags.map(tag => tag.name).join(', ')
                  : dollData.tags
              }
            </div>
          </div>
        </div>
        
        {/* 貼文列表區域 */}
        <div style={{
          backgroundColor: 'white',
          padding: '10px 0'
        }}>
          <h5 style={{ 
            textAlign: 'center', 
            margin: '5px 0 15px',
            fontSize: '16px'
          }}>
            貼文
          </h5>
          
          <div style={{ padding: '0 15px' }}>
            <PostList 
              mode="profile"
              profileDollId={dollData.id}
            />
          </div>
        </div>
      </div>
    );
  };

  // 編輯模態框 (共用)
  const EditDollModal = () => (
    <EditDoll 
      isOpen={isEditModalOpen} 
      toggle={toggleEditModal} 
      dollData={dollData} 
      onDollUpdated={(updatedDoll) => setDoll(updatedDoll)}
    />
  );
  
  // 根據螢幕大小渲染對應版本
  return (
    <>
      {isMobile ? renderMobileVersion() : renderDesktopVersion()}
      <EditDollModal />
    </>
  );
}
