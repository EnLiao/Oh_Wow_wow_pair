import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../services/auth_context';
import { get_tags, edit_doll } from '../services/api';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  FormText,
  Spinner,
  Badge,
  Alert,
  Row,
  Col
} from 'reactstrap';

export default function EditDoll({ isOpen, toggle, dollData, onDollUpdated }) {
  const auth_context = useContext(AuthContext);
  
  // 狀態
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [description, setDescription] = useState('');
  const [avatarImage, setAvatarImage] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // 當模態框開啟且有娃娃數據時，初始化表單
  useEffect(() => {
    if (isOpen && dollData) {
      setName(dollData.name || '');
      setBirthday(dollData.birthday || '');
      setDescription(dollData.description || '');
      setPreviewImage(dollData.avatar_image || '');
      
      // 如果有標籤數據，設置已選標籤
      if (Array.isArray(dollData.tags)) {
        const tagIds = dollData.tags.map(tag => typeof tag === 'object' ? tag.id : tag);
        setSelectedTagIds(tagIds);
      } else {
        setSelectedTagIds([]);
      }
    }
  }, [isOpen, dollData]);
  
  // 載入所有可用標籤
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await get_tags();
        setAvailableTags(response.data);
      } catch (err) {
        console.error('無法載入標籤:', err);
      }
    };
    
    if (isOpen) {
      fetchTags();
    }
  }, [isOpen]);
  
  // 處理圖片選擇
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarImage(file);
      
      // 創建預覽
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // 處理標籤點擊
  const handleTagClick = (tagId) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter(id => id !== tagId));
    } else {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  const handleClick = () => {
    setTimeout(handleSubmit, 0); // 等下一輪 event loop，state 已更新
  };
  
  // 提交表單
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // 創建 FormData 對象
      const formData = new FormData();
      formData.append('name', name);
      formData.append('birthday', birthday);
      formData.append('description', description);
      
      // 如果有新圖片，添加到表單
      if (avatarImage) {
        formData.append('avatar_image', avatarImage);
      }
      
      // 添加選擇的標籤
      selectedTagIds.forEach(tagId => {
        formData.append('tag_ids', tagId);
      });
      
      // 發送請求
      console.log('提交數據:', {
        name,
        birthday,
        description,
        selectedTagIds,
        hasNewImage: !!avatarImage
      });
      
      const response = await edit_doll(dollData.id, formData);
      console.log('更新成功:', response.data);
      
      // 更新成功
      setSuccess(true);
      
      // 通知父組件更新
      if (onDollUpdated) {
        onDollUpdated(response.data);
      }
      
      // 2秒後關閉對話框
      setTimeout(() => {
        toggle();
        setSuccess(false);
      }, 2000);
      
    } catch (err) {
      console.error('更新失敗:', err);
      setError(err.response?.data?.detail || '更新娃娃資料失敗');
    } finally {
      setLoading(false);
    }
  };
  
  // 取消編輯
  const handleCancel = () => {
    toggle();
    setError(null);
    setSuccess(false);
  };
  
  return (
    <Modal isOpen={isOpen} toggle={handleCancel} size="lg">
      <ModalHeader toggle={handleCancel}>
        編輯娃娃資料: {dollData?.id}
      </ModalHeader>
      
      <ModalBody>
        {error && (
          <Alert color="danger" className="mb-4">
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert color="success" className="mb-4">
            娃娃資料更新成功！
          </Alert>
        )}
        
        <Form>
          <Row>
            <Col md={8}>
              <FormGroup>
                <Label for="name">名稱</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="輸入娃娃名稱"
                />
              </FormGroup>
              
              <FormGroup>
                <Label for="birthday">生日</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                />
              </FormGroup>
              
              <FormGroup>
                <Label for="description">介紹</Label>
                <Input
                  id="description"
                  type="textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="關於這個娃娃的介紹..."
                  rows={3}
                />
              </FormGroup>
            </Col>
            
            <Col md={4}>
              <FormGroup>
                <Label>頭像</Label>
                <div className="text-center mb-2">
                  <img
                    src={previewImage}
                    alt={name || '娃娃'}
                    style={{ 
                      width: '100%', 
                      maxWidth: '150px',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #ddd'
                    }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                    }}
                  />
                </div>
                <Input
                  id="avatarImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <FormText color="muted">
                  選擇一張新的頭像圖片
                </FormText>
              </FormGroup>
            </Col>
          </Row>
          
          <FormGroup>
            <Label>標籤</Label>
            <div className="d-flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <Badge
                  key={tag.id}
                  color={selectedTagIds.includes(tag.id) ? "primary" : "secondary"}
                  style={{ 
                    cursor: 'pointer',
                    padding: '8px 12px',
                    margin: '0 5px 5px 0',
                    backgroundColor: selectedTagIds.includes(tag.id) ? '#ffd5fc' : '#e9ecef',
                    color: selectedTagIds.includes(tag.id) ? '#000' : '#555',
                    border: 'none'
                  }}
                  onClick={() => handleTagClick(tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
              
              {availableTags.length === 0 && (
                <div className="text-muted">載入標籤中...</div>
              )}
            </div>
          </FormGroup>
        </Form>
      </ModalBody>
      
      <ModalFooter>
        <Button color="secondary" onClick={handleCancel} disabled={loading}>
          取消
        </Button>
        <Button
          onClick={handleClick}
          disabled={loading}
          style={{
            backgroundColor: '#ffd5fc',
            border: 'none',
            color: '#000'
          }}
        >
          {loading ? <Spinner size="sm" /> : '儲存變更'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}