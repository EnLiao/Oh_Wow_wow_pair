import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../services/auth_context';
import { getPosts } from '../services/api';

export default function Post({ user, content, image }) {
    const auth_context = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    useEffect(() => {
      const fetchPosts = async () => {
        try {
          const res = await getPosts();
          console.log('Fetched posts:', res.data);
        } catch (err) {
          console.error('Failed to fetch posts:', err);
        }
      };
      fetchPosts();
    }, [auth_context.isAuthenticated]);
    return (
      <div style={{
        border: '1px solid #ddd',
        borderRadius: '10px',
        padding: '15px',
        marginBottom: '20px',
        width: '100%'
      }}>
        <h4 style={{ marginBottom: '10px' }}>{user}</h4>
        <p>{content}</p>
        {image && (
          <img
            src={image}
            alt="post image"
            style={{
              width: '100%',
              borderRadius: '10px',
              marginTop: '10px',
              objectFit: 'cover'
            }}
          />
        )}
      </div>
    );
  }
  