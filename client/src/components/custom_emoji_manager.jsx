import React, { useState, useEffect } from 'react';
import { chatAPI } from '../services/api.js';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
  Card,
  CardBody,
  CardImg,
  Row,
  Col,
  Spinner
} from 'reactstrap';
import './custom_emoji_manager.css';

const CustomEmojiManager = ({ isOpen, toggle, roomId = null, onUploadSuccess }) => {
  const [customEmojis, setCustomEmojis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // 上傳表單狀態
  const [newEmojiName, setNewEmojiName] = useState('');
  const [newEmojiFile, setNewEmojiFile] = useState(null);
  const [isPublic, setIsPublic] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadCustomEmojis();
    }
  }, [isOpen, roomId]);

  const loadCustomEmojis = async () => {
    setLoading(true);
    try {
      const response = await chatAPI.getCustomEmojis(roomId);
      setCustomEmojis(response.data);
    } catch (err) {
      console.error('載入自訂表情符號失敗:', err);
      setError('載入自訂表情符號失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 檢查檔案類型
      const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError('只支援 PNG、JPG、JPEG 和 GIF 格式');
        return;
      }

      // 檢查檔案大小（限制 5MB）
      if (file.size > 5 * 1024 * 1024) {
        setError('檔案大小不能超過 5MB');
        return;
      }

      setNewEmojiFile(file);
      setError(null);

      // 創建預覽
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!newEmojiName.trim()) {
      setError('請輸入表情符號名稱');
      return;
    }

    if (!newEmojiFile) {
      setError('請選擇圖片檔案');
      return;
    }

    // 檢查名稱格式（只允許英文字母、數字和底線）
    const namePattern = /^[a-zA-Z0-9_]+$/;
    if (!namePattern.test(newEmojiName)) {
      setError('名稱只能包含英文字母、數字和底線');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await chatAPI.createCustomEmoji({
        name: newEmojiName,
        image: newEmojiFile,
        is_public: isPublic,
        room_id: roomId
      });

      setSuccess('表情符號上傳成功！');
      
      // 重設表單
      setNewEmojiName('');
      setNewEmojiFile(null);
      setPreviewUrl(null);
      setIsPublic(false);
      
      // 重新載入列表
      loadCustomEmojis();

      // 通知父層立即更新（讓選擇器立刻顯示新表情）
      if (typeof onUploadSuccess === 'function') {
        onUploadSuccess();
      }

      // 3秒後清除成功訊息
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('上傳表情符號失敗:', err);
      const errorMessage = err.response?.data?.name?.[0] || 
                          err.response?.data?.detail || 
                          '上傳失敗，請稍後再試';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (emojiId) => {
    if (!window.confirm('確定要刪除這個表情符號嗎？')) {
      return;
    }

    try {
      await chatAPI.deleteCustomEmoji(emojiId);
      setSuccess('表情符號已刪除');
      loadCustomEmojis();
      // 刪除後也同步刷新父層的清單
      if (typeof onUploadSuccess === 'function') {
        onUploadSuccess();
      }
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('刪除表情符號失敗:', err);
      setError('刪除失敗，請稍後再試');
    }
  };

  const resetForm = () => {
    setNewEmojiName('');
    setNewEmojiFile(null);
    setPreviewUrl(null);
    setIsPublic(false);
    setError(null);
    setSuccess(null);
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" className="custom-emoji-modal">
      <ModalHeader toggle={toggle}>
        自訂表情符號管理
      </ModalHeader>
      
      <ModalBody>
        {error && (
          <Alert color="danger" className="mb-3">
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert color="success" className="mb-3">
            {success}
          </Alert>
        )}

        {/* 上傳新表情符號 */}
        <Card className="mb-4">
          <CardBody>
            <h5>上傳新表情符號</h5>
            <Form>
              <Row>
                <Col md={8}>
                  <FormGroup>
                    <Label for="emojiName">名稱</Label>
                    <Input
                      id="emojiName"
                      type="text"
                      value={newEmojiName}
                      onChange={(e) => setNewEmojiName(e.target.value)}
                      placeholder="例如: mycat, happy_face"
                      maxLength={50}
                    />
                    <small className="text-muted">
                      只能使用英文字母、數字和底線，將顯示為 :{newEmojiName}:
                    </small>
                  </FormGroup>
                  
                  <FormGroup>
                    <Label for="emojiFile">圖片檔案</Label>
                    <Input
                      id="emojiFile"
                      type="file"
                      accept="image/png,image/jpg,image/jpeg,image/gif"
                      onChange={handleFileSelect}
                    />
                    <small className="text-muted">
                      支援 PNG、JPG、GIF 格式，檔案大小不超過 5MB
                    </small>
                  </FormGroup>
                  
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                    />
                    <Label check>
                      公開給其他用戶使用
                    </Label>
                  </FormGroup>
                </Col>
                
                <Col md={4}>
                  <FormGroup>
                    <Label>預覽</Label>
                    <div className="emoji-preview">
                      {previewUrl ? (
                        <img src={previewUrl} alt="預覽" className="preview-image" />
                      ) : (
                        <div className="no-preview">選擇圖片後會顯示預覽</div>
                      )}
                    </div>
                  </FormGroup>
                </Col>
              </Row>
              
              <Button
                color="primary"
                onClick={handleUpload}
                disabled={uploading || !newEmojiName || !newEmojiFile}
                style={{ backgroundColor: '#ffd5fc', borderColor: '#ffd5fc', color: '#000' }}
              >
                {uploading ? <Spinner size="sm" /> : '上傳表情符號'}
              </Button>
            </Form>
          </CardBody>
        </Card>

        {/* 現有表情符號列表 */}
        <div>
          <h5>我的表情符號</h5>
          {loading ? (
            <div className="text-center py-4">
              <Spinner color="primary" />
              <div>載入中...</div>
            </div>
          ) : customEmojis.length > 0 ? (
            <Row>
              {customEmojis.map(emoji => (
                <Col key={emoji.id} xs={6} sm={4} md={3} className="mb-3">
                  <Card className="emoji-card">
                    <CardImg
                      top
                      src={emoji.image}
                      alt={emoji.name}
                      className="emoji-card-img"
                    />
                    <CardBody className="p-2">
                      <div className="emoji-info">
                        <div className="emoji-name">:{emoji.name}:</div>
                        {emoji.is_public && (
                          <small className="text-success">公開</small>
                        )}
                      </div>
                      <Button
                        size="sm"
                        color="danger"
                        onClick={() => handleDelete(emoji.id)}
                        className="delete-btn"
                      >
                        刪除
                      </Button>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="text-center text-muted py-4">
              還沒有自訂表情符號，立即上傳一個吧！
            </div>
          )}
        </div>
      </ModalBody>
      
      <ModalFooter>
        <Button 
          color="secondary" 
          onClick={() => {
            resetForm();
            toggle();
          }}
        >
          關閉
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default CustomEmojiManager;
