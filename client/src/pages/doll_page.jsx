import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../services/auth_context';
import { getDollInfo } from '../services/api';
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
  const { id } = useParams(); // 從 URL 獲取娃娃 ID
  const navigate = useNavigate();
  const auth_context = React.useContext(AuthContext);
  
  const [doll, setDoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 使用 useEffect 在元件掛載時獲取數據
  useEffect(() => {
    const fetchDollData = async () => {
      try {
        setLoading(true);
        const res = await getDollInfo(id || auth_context.currentDollId);
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
  }, [id, auth_context.currentDollId]); // 當 ID 變化時重新獲取數據
  
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
    photo: doll_img,
    username: '-',
    birthday: '-',
    bio: '-',
    tag: '-'
  };
  
  return (
    <Container className="mt-5" style={{ paddingTop: 50 }}>
      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <CardHeader tag="h2">{dollData.id}</CardHeader>
            <CardBody>
              <CardImg 
                src={dollData.photo} 
                alt={dollData.name} 
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
                  <strong>Birthday:</strong> {dollData.birthday}
                </ListGroupItem>
                <ListGroupItem>
                  <strong>Bio:</strong> {dollData.description}
                </ListGroupItem>
                <ListGroupItem>
                  <strong>Tag:</strong> {dollData.tag}
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
              {/* 這裡可以放置娃娃的貼文列表 */}
              {dollData.posts && dollData.posts.length > 0 ? (
                dollData.posts.map(post => (
                  <Card key={post.id} className="mb-3">
                    {/* 貼文內容 */}
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted">尚無貼文</p>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
