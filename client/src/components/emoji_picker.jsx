import React, { useState, useRef, useEffect } from 'react';
import { 
  EMOJI_CATEGORIES, 
  getAllCategories, 
  getEmojisByCategory, 
  getCategoryInfo,
  getFrequentlyUsedEmojis,
  searchEmojis 
} from '../utils/emoji_library.js';
import './emoji_picker.css';

const EmojiPicker = ({ 
  isOpen, 
  onEmojiSelect, 
  onClose, 
  position = 'bottom',
  showRecentEmojis = true,
  customEmojis = []
}) => {
  const [activeCategory, setActiveCategory] = useState('smileys');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentEmojis, setRecentEmojis] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const pickerRef = useRef(null);

  useEffect(() => {
    // 載入最近使用的表情符號
    const savedRecentEmojis = localStorage.getItem('recentEmojis');
    if (savedRecentEmojis) {
      try {
        setRecentEmojis(JSON.parse(savedRecentEmojis));
      } catch (error) {
        console.error('載入最近使用表情符號失敗:', error);
      }
    } else {
      // 如果沒有最近使用的，設置一些預設的常用表情符號
      setRecentEmojis(getFrequentlyUsedEmojis().slice(0, 24));
    }
  }, []);

  useEffect(() => {
    // 點擊外部關閉選擇器
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    // 搜尋表情符號
    if (searchQuery.trim()) {
      const results = searchEmojis(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleEmojiClick = (emoji) => {
    // 更新最近使用的表情符號
    const updatedRecent = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, 24);
    setRecentEmojis(updatedRecent);
    localStorage.setItem('recentEmojis', JSON.stringify(updatedRecent));
    
    // 回調選中的表情符號
    onEmojiSelect(emoji);
  };

  const handleCustomEmojiClick = (customEmoji) => {
    onEmojiSelect(customEmoji, 'custom');
  };

  const renderEmojiGrid = (emojis, isCustom = false) => {
    return (
      <div className="emoji-grid">
        {emojis.map((emoji, index) => (
          <button
            key={isCustom ? emoji.id : index}
            className="emoji-item"
            onClick={() => isCustom ? handleCustomEmojiClick(emoji) : handleEmojiClick(emoji)}
            title={isCustom ? emoji.name : emoji}
          >
            {isCustom ? (
              <img 
                src={emoji.image.startsWith('http') 
                  ? emoji.image 
                  : `http://localhost:8001${emoji.image}`} 
                alt={emoji.name} 
                className="custom-emoji-image" 
              />
            ) : (
              emoji
            )}
          </button>
        ))}
      </div>
    );
  };

  const renderCategoryTabs = () => {
    const categories = ['recent', ...getAllCategories()];
    if (customEmojis.length > 0) {
      categories.push('custom');
    }

    return (
      <div className="category-tabs">
        {categories.map(category => {
          if (category === 'recent') {
            return (
              <button
                key="recent"
                className={`category-tab ${activeCategory === 'recent' ? 'active' : ''}`}
                onClick={() => setActiveCategory('recent')}
                title="最近使用"
              >
                🕒
              </button>
            );
          }
          
          if (category === 'custom') {
            return (
              <button
                key="custom"
                className={`category-tab ${activeCategory === 'custom' ? 'active' : ''}`}
                onClick={() => setActiveCategory('custom')}
                title="自訂表情符號"
              >
                ⭐
              </button>
            );
          }

          const categoryInfo = getCategoryInfo(category);
          return (
            <button
              key={category}
              className={`category-tab ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
              title={categoryInfo.name}
            >
              {categoryInfo.icon}
            </button>
          );
        })}
      </div>
    );
  };

  const renderContent = () => {
    if (searchQuery.trim()) {
      return (
        <div className="emoji-content">
          <div className="emoji-section">
            <div className="section-title">搜尋結果</div>
            {searchResults.length > 0 ? (
              renderEmojiGrid(searchResults)
            ) : (
              <div className="no-results">未找到匹配的表情符號</div>
            )}
          </div>
        </div>
      );
    }

    if (activeCategory === 'recent') {
      return (
        <div className="emoji-content">
          <div className="emoji-section">
            <div className="section-title">最近使用</div>
            {recentEmojis.length > 0 ? (
              renderEmojiGrid(recentEmojis)
            ) : (
              <div className="no-results">還沒有使用過表情符號</div>
            )}
          </div>
        </div>
      );
    }

    if (activeCategory === 'custom') {
      return (
        <div className="emoji-content">
          <div className="emoji-section">
            <div className="section-title">自訂表情符號</div>
            {customEmojis.length > 0 ? (
              renderEmojiGrid(customEmojis, true)
            ) : (
              <div className="no-results">還沒有自訂表情符號</div>
            )}
          </div>
        </div>
      );
    }

    const categoryEmojis = getEmojisByCategory(activeCategory);
    const categoryInfo = getCategoryInfo(activeCategory);

    return (
      <div className="emoji-content">
        <div className="emoji-section">
          <div className="section-title">{categoryInfo.name}</div>
          {renderEmojiGrid(categoryEmojis)}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className={`emoji-picker ${position}`} ref={pickerRef}>
      <div className="emoji-picker-header">
        <input
          type="text"
          className="emoji-search"
          placeholder="搜尋表情符號..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {renderCategoryTabs()}
      {renderContent()}
    </div>
  );
};

export default EmojiPicker;
