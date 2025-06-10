import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../services/auth_context';
import { getDollInfo } from '../services/api';
import PostList from '../components/load_post';
import { MdModeEditOutline } from "react-icons/md";
import EditDoll from '../components/edit_doll';
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
  console.log(doll_id);
  const auth_context = React.useContext(AuthContext);
  
  const [doll, setDoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const toggleEditModal = () => {
    setIsEditModalOpen(!isEditModalOpen);
  };
  
  // 使用 useEffect 在元件掛載時獲取數據
  useEffect(() => {
    const fetchDollData = async () => {
      try {
        setLoading(true);
        const res = await getDollInfo(doll_id || auth_context.currentDollId);
        console.log('doll info', res.data);
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
  }, [doll_id, auth_context.currentDollId]); // 當 ID 變化時重新獲取數據
  
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
  
  return (
    <Container className="mt-5" style={{ paddingTop: 50 }}>
      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <CardHeader className="d-flex align-items-center justify-content-between">
              <h2 className="mb-0">{dollData.id}</h2>
              <MdModeEditOutline 
                style={{ cursor: 'pointer', fontSize: '1.25rem' }} 
                onClick={toggleEditModal}  
              />
              <EditDoll 
                isOpen={isEditModalOpen} 
                toggle={toggleEditModal} 
                dollData={dollData} 
                onDollUpdated={(updatedDoll) => setDoll(updatedDoll)}
              />
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
                  e.target.src = doll_img; // 設置為預設圖片
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
                      ? dollData.tags.join(', ')
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
}
