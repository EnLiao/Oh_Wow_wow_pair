import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../services/auth_context';
import { getPosts, follow, unfollow } from '../services/api';
import { Card, CardBody, CardTitle, CardText, CardImg, Spinner } from 'reactstrap';
import { FaRegCommentDots } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa6";
import { FaHeart } from "react-icons/fa6";

export default function PostList({ mode = 'feed', profileDollId }) {
  const auth = useContext(AuthContext);
  const viewerId = auth.currentDollId;          // 目前登入者
  const targetId = mode === 'profile' ? profileDollId : viewerId;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [following, setFollowing] = useState(new Set());

  const toggleLike = (postId) => {
    setLikedPosts(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(postId)) {
        newLiked.delete(postId);
      } else {
        newLiked.add(postId);
      }
      return newLiked;
    });
  };

  const toggleFollowing = (postId) => {
    setFollowing(prev => {
      const newFollowing = new Set(prev);
      if (newFollowing.has(postId)) {
        newFollowing.delete(postId);
      } else {
        newFollowing.add(postId);
      }
      return newFollowing;
    });
  };

  // 修改 handleSubmit 函數，使其可以接受一個 dollId 參數
  const handleSubmit = async (dollId) => {
    // 檢查是否已經追蹤這個娃娃
    const isFollowing = following.has(dollId);
    
    if (isFollowing) {
      const unfollowData = {
        from_doll_id: dollId,  // 使用傳入的 dollId
        to_doll_id: viewerId,
      };
      try {
        const response = await unfollow(unfollowData);
        console.log('已取消追蹤:', response.data);
        toggleFollowing(dollId);
      } catch (err) {
        console.error('取消追蹤失敗:', err);
      }
    } else {
      const followData = {
        from_doll_id: dollId,  // 使用傳入的 dollId
        to_doll_id: viewerId,
      };
      console.log('追蹤:', followData);
      try {
        const response = await follow(followData);
        console.log('已追蹤:', response.data);
        toggleFollowing(dollId);
      } catch (err) {
        console.error('追蹤失敗:', err);
      }
    }
  };

  // ➜ 依 mode / targetId 變動重新抓取
  console.log(viewerId, targetId, mode);
  useEffect(() => {
    if (!viewerId || !targetId) return;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const fetched = await getPosts({
          mode,
          targetDollId: targetId,
          viewerDollId: viewerId,
          limit: 5,
          offset: 0,
        });

        setPosts(fetched);
        console.log('已載入貼文:', fetched);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.detail || err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [mode, targetId, viewerId]);

  if (loading)
    return (
      <div className="text-center my-4">
        <Spinner color="primary" />
        <p>載入貼文中...</p>
      </div>
    );

  if (error)
    return (
      <Card className="my-3 text-danger">
        <CardBody>
          <CardTitle tag="h5">發生錯誤</CardTitle>
          <CardText>{error}</CardText>
        </CardBody>
      </Card>
    );

  if (!posts.length)
    return (
      <Card className="my-3">
        <CardBody>
          <CardText className="text-center">暫無貼文</CardText>
        </CardBody>
      </Card>
    );

  return (
    <>
      {posts.map((p) => (
        <Card key={p.id} className="mb-3">
          <CardBody>
            <div className="d-flex align-items-center mb-2">
                <img
                  src={auth.doll_img}
                  alt={p.dollName}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    marginRight: 10,
                    objectFit: 'cover',
                    userSelect: 'none', 
                    cursor: 'pointer'
                  }}
                />
              <CardTitle tag="h5" className="mb-0">
                {p.dollName}
              </CardTitle>
                <p 
                  className="mb-0" 
                  style={{ 
                    marginLeft: '15px', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    backgroundColor: following.has(p.dollName) ? '#ffd5fc' : '#f0f0f0',  // 使用 authorId
                    color: following.has(p.dollName) ? '#666666' : '#666666', 
                    padding: '2px 6px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    transition: 'all 0.2s ease',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSubmit(p.dollName)}  // 直接呼叫 handleSubmit 並傳入作者 ID
                >
                  {following.has(p.dollName) ? 'followed' : 'follow'} 
                </p>
            </div>

            <CardText style={{marginBottom:10}}>{p.content}</CardText>

            {p.image && (
              <CardImg
                bottom
                src={p.image}
                alt="貼文圖片"
                style={{ borderRadius: '10px', marginBottom:10, userSelect: 'none' }}
              />
            )}
            {likedPosts.has(p.id) ? (
              <FaHeart 
                style={{
                  marginRight: 15, 
                  cursor: 'pointer',
                  width: '1.2em',
                  height: '1.2em',
                  color: '#ffd5fc'
                }}
                onClick={() => toggleLike(p.id)}
              />
            ) : (
              <FaRegHeart 
                style={{
                  marginRight: 15, 
                  cursor: 'pointer',
                  width: '1.2em',
                  height: '1.2em'
                }}
                onClick={() => toggleLike(p.id)}
              />
            )}
            <FaRegCommentDots 
              style={{
                marginRight:10, 
                cursor: 'pointer',
                width: '1.2em',
                height: '1.2em'
              }}
            />
          </CardBody>
        </Card>
      ))}
    </>
  );
}