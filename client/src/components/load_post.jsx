import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../services/auth_context';
import { getPosts } from '../services/api';
import { Card, CardBody, CardTitle, CardText, CardImg, Spinner } from 'reactstrap';

export default function PostList() {
  const auth_context = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 需要傳入當前娃娃的 ID 參數
        const dollId = auth_context.currentDollId;
        
        if (!dollId) {
          console.error('無法獲取貼文: 缺少娃娃 ID');
          setError('無法獲取貼文: 缺少娃娃 ID');
          setLoading(false);
          return;
        }
        
        const res = await getPosts(dollId);
        console.log('獲取的貼文:', res.data);
        setPosts(res.data);
      } catch (err) {
        console.error('獲取貼文失敗:', err);
        setError('獲取貼文失敗: ' + (err.response?.data?.detail || err.message));
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [auth_context.currentDollId]);

  // 顯示載入中
  if (loading) {
    return (
      <div className="text-center my-4">
        <Spinner color="primary" />
        <p>載入貼文中...</p>
      </div>
    );
  }

  // 顯示錯誤
  if (error) {
    return (
      <Card className="my-3 text-danger">
        <CardBody>
          <CardTitle tag="h5">發生錯誤</CardTitle>
          <CardText>{error}</CardText>
        </CardBody>
      </Card>
    );
  }

  // 顯示沒有貼文的情況
  if (posts.length === 0) {
    return (
      <Card className="my-3">
        <CardBody>
          <CardText className="text-center">暫無貼文</CardText>
        </CardBody>
      </Card>
    );
  }

  // 顯示貼文列表
  return (
    <div>
      {posts.map((post) => (
        <Card key={post.id} className="mb-3">
          <CardBody>
            <div className="d-flex align-items-center mb-2">
              {post.doll_avatar && (
                <img
                  src={post.doll_avatar}
                  alt={post.doll_name}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    marginRight: 10,
                    objectFit: 'cover'
                  }}
                />
              )}
              <CardTitle tag="h5" className="mb-0">
                {post.doll_name}
              </CardTitle>
            </div>
            
            <CardText>{post.content}</CardText>
            
            {post.image && (
              <CardImg
                bottom
                src={post.image}
                alt="貼文圖片"
                style={{
                  borderRadius: '10px',
                  marginTop: '10px'
                }}
              />
            )}
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
