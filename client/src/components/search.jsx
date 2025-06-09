import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from 'reactstrap';
import { searchDolls } from '../services/api';

export default function Search({ keyword, onResultClick }) {
  const navigate = useNavigate();
  const [dolls, setDolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleResultClick = (dollId) => {
    // 先通知父組件關閉搜尋面板
    if (onResultClick) {
      onResultClick();
    }
    navigate(`/doll_page/${dollId}`);
  };

  // 當關鍵字變更時執行搜尋
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!keyword) {
        setDolls([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await searchDolls(keyword);
        setDolls(response.data.results || []);
      } catch (err) {
        console.error('搜尋失敗:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [keyword]);

  if (loading) {
    return <div className="text-center py-3"><Spinner size="sm" /> 搜尋中...</div>;
  }

  if (error) {
    return <div className="text-danger py-3">搜尋出錯: {error}</div>;
  }

  return (
    <div className="search-results">
      <h6 className="mb-3">搜尋結果：娃娃 ({dolls.length})</h6>
      
      {dolls.length > 0 ? (
        <div className="doll-list">
          {dolls.map((doll, index) => (
            <div 
              key={`doll-${doll.id || index}`}
              className="doll-list-item" 
              onClick={() => handleResultClick(doll.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid #eee',
                cursor: 'pointer'
              }}
            >
              <img
                src={doll.avatar}
                alt={doll.name || '娃娃'}
                style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  marginRight: 10,
                  objectFit: 'cover'
                }}
              />
              <div>
                <div style={{ fontWeight: 'bold' }}>{doll.id}</div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>{doll.name}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-3">沒有找到相符的娃娃</div>
      )}
    </div>
  );
}