// src/components/Post.jsx
export default function Post({ user, content, image }) {
    return (
      <div style={{
        border: '1px solid #ddd',
        borderRadius: '10px',
        padding: '15px',
        marginBottom: '20px',
        width: '100%',
        maxWidth: '500px'
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
  