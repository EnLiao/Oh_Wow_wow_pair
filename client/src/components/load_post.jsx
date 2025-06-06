import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../services/auth_context';
import { getPosts } from '../services/api';
import { Card, CardBody, CardTitle, CardText, CardImg, Spinner } from 'reactstrap';

export default function PostList({ mode = 'feed', profileDollId }) {
  const auth = useContext(AuthContext);
  const viewerId = auth.currentDollId;          // 目前登入者
  const targetId = mode === 'profile' ? profileDollId : viewerId;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
              {p.dollAvatar && (
                <img
                  src={p.dollAvatar}
                  alt={p.dollName}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    marginRight: 10,
                    objectFit: 'cover',
                  }}
                />
              )}
              <CardTitle tag="h5" className="mb-0">
                {p.dollName}
              </CardTitle>
            </div>

            <CardText>{p.content}</CardText>

            {p.image && (
              <CardImg
                bottom
                src={p.image}
                alt="貼文圖片"
                style={{ borderRadius: '10px', marginTop: 10 }}
              />
            )}
          </CardBody>
        </Card>
      ))}
    </>
  );
}