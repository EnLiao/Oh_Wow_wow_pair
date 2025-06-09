import { useState, useEffect, useContext } from "react";
import { getComments, postComments } from "../services/api";
import { AuthContext } from "../services/auth_context";
import { Input, Button, ListGroup, ListGroupItem, Spinner } from "reactstrap";
// import { getComments, createComment } from "../services/api";
import { IoMdSend } from "react-icons/io";

export default function PostComment({ postId }) {
  const auth = useContext(AuthContext);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // 載入評論
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getComments(postId);
        setComments(response.data);
      } catch (err) {
        console.error("載入評論失敗:", err);
        setError(err.response?.data?.detail || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  // 提交評論
  const handleSubmitComment = async () => {
    if (!comment.trim()) return;

    try {
      setSubmitting(true);
      const commentData = {
        doll_id: auth.currentDollId,
        content: comment,
        post_id: postId
      };

      const response = await postComments(postId, commentData);
      setComments(prevComments => [response.data, ...prevComments]);
      setComment("");
    } catch (err) {
      console.error("提交評論失敗:", err);
      alert(err.response?.data?.detail || "評論提交失敗，請重試");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-3">
      <div className="d-flex mb-3">
        <Input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Fill something..."
          disabled={submitting}
          className="me-2"
        />
        <Button 
          onClick={handleSubmitComment}
          disabled={submitting || !comment.trim()}
          style={{
            backgroundColor: '#ffffff',
            border: 'none',
            color: '#000', 
            cursor: submitting ? 'not-allowed' : 'pointer',
            width: '30px',
            height: '30px',
          }}
        >
        <IoMdSend/>
        </Button>
      </div>

      {loading ? (
        <div className="text-center my-3">
          <Spinner color="primary" size="sm" /> 載入評論中...
        </div>
      ) : error ? (
        <div className="text-danger">{error}</div>
      ) : comments.length > 0 ? (
        <ListGroup className="comment-list">
          {comments.map((c) => (
            <ListGroupItem key={c.local_id} className="px-0 py-2 border-0">
              <div className="d-flex align-items-center mb-1">
                <img
                  src={c.doll_avatar}
                  alt={c.doll_id}
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
                <strong className="me-2">{c.doll_id}</strong>
                <small className="text-muted">
                  {new Date(c.created_at).toLocaleString()}
                </small>
              </div>
              <div>{c.content}</div>
            </ListGroupItem>
          ))}
        </ListGroup>
      ) : (
        <div className="text-center text-muted my-3">暫無評論</div>
      )}
    </div>
  );
}