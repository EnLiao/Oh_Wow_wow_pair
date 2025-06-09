import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../services/auth_context';
import { getPosts, follow, unfollow, likePost, unlikePost } from '../services/api';
import PostComment from './post_comment';
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
  const [commentingPostId, setCommentingPostId] = useState(null);

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

  const likeSubmit = async (postId) => {
    const isLiked = likedPosts.has(postId);
    const dollId = auth.currentDollId;
    try {
      if (isLiked) {
        await unlikePost(postId, dollId);
        console.log('已取消喜歡:', postId);
        toggleLike(postId);

        // 更新貼文的 like_count
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { ...post, like_count: Math.max(0, post.like_count - 1) } 
              : post
          )
        );

      } else {
        await likePost(postId, dollId);
        console.log('已喜歡:', postId);
        toggleLike(postId);

        // 更新貼文的 like_count
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { ...post, like_count: post.like_count + 1 } 
              : post
          )
        );

      }
    } catch (err) {
      console.error('喜歡/取消喜歡失敗:', err);
      alert(err.response?.data?.detail || '操作失敗，請稍後再試');
    }
  };

  const toggleComment = (postId) => {
    setCommentingPostId(prevId => prevId === postId ? null : postId);
  };

  const followSubmit = async (dollId) => {
    // 找到當前貼文
    const currentPost = posts.find(p => p.doll_id === dollId);
    // 檢查是否已經追蹤這個娃娃
    const isFollowing = currentPost?.is_followed ?? false;
    
    try {
      if (isFollowing) {
        const unfollowData = {
          from_doll_id: dollId,
          to_doll_id: viewerId,
        };
        
        await unfollow(unfollowData);
        console.log('已取消追蹤:', dollId);
        
        // 直接更新貼文的 is_followed 屬性
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.doll_id === dollId 
              ? { ...post, is_followed: false } 
              : post
          )
        );
      } else {
        const followData = {
          from_doll_id: viewerId,
          to_doll_id: dollId,
        };
        
        await follow(followData);
        console.log('已追蹤:', dollId);
        
        // 直接更新貼文的 is_followed 屬性
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.doll_id === dollId 
              ? { ...post, is_followed: true } 
              : post
          )
        );
      }
    } catch (err) {
      console.error('追蹤操作失敗:', err);
      alert(err.response?.data?.detail || '操作失敗，請稍後再試');
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

        const initialLikedPosts = new Set(
          fetched
            .filter(post => post.liked_by_me === true)
            .map(post => post.id)
        );
        setLikedPosts(initialLikedPosts);

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
                  alt={p.doll_id}
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
                {p.doll_id}
              </CardTitle>
                {!p.is_followed && (
                  <p 
                    className="mb-0" 
                    style={{ 
                      marginLeft: '15px', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      backgroundColor: '#f0f0f0',
                      color: '#666666', 
                      padding: '2px 6px',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      transition: 'all 0.2s ease',
                      userSelect: 'none'
                    }}
                    onClick={() => followSubmit(p.doll_id)}
                  >
                    follow
                  </p>
                )}
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
            <div style={{display: 'flex', alignItems: 'center'}}>
              <div style={{
                display: 'flex', 
                alignItems: 'center', 
                marginRight: 15
              }}>
                {likedPosts.has(p.id) ? (
                  <FaHeart 
                    style={{
                      cursor: 'pointer',
                      width: '1.2em',
                      height: '1.2em',
                      color: '#ffd5fc'
                    }}
                    onClick={() => likeSubmit(p.id)}
                  />
                ) : (
                  <FaRegHeart 
                    style={{
                      cursor: 'pointer',
                      width: '1.2em',
                      height: '1.2em'
                    }}
                    onClick={() => likeSubmit(p.id)}
                  />
                )}
                <p style={{
                  margin: 0,
                  marginRight: 5,
                  marginLeft: 10,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {p.like_count}
                </p>
              </div>
              <FaRegCommentDots 
                style={{
                  cursor: 'pointer',
                  width: '1.2em',
                  height: '1.2em'
                }}
                onClick={() => toggleComment(p.id)}
              />
            </div>
            {commentingPostId === p.id && <PostComment postId={p.id} />}
          </CardBody>
        </Card>
      ))}
    </>
  );
}