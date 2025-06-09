import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Col,
  Spinner,
  Alert
} from 'reactstrap';

export default function EditDoll({ isOpen, toggle, dollData, onDollUpdated }) {
  const auth_context = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // 表單數據
  const [dollName, setDollName] = useState('');
  const [dollBirthday, setDollBirthday] = useState('');
  const [dollDescription, setDollDescription] = useState('');
  const [dollImage, setDollImage] = useState(null);
  const [showTags, setShowTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  // 載入標籤數據
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await get_tags();
        setShowTags(res.data);
      } catch (err) {
        console.error('獲取標籤失敗:', err);
      }
    };
    
    fetchTags();
  }, []);

  // 當 dollData 變化時更新表單數據
  useEffect(() => {
    if (dollData && isOpen) {
      console.log('初始化表單數據:', dollData);
      setDollName(dollData.name || '');
      setDollBirthday(dollData.birthday || '');
      setDollDescription(dollData.description || '');
      
      // 處理標籤
      if (Array.isArray(dollData.tags) && showTags.length > 0) {
        const tagObjects = dollData.tags.map(tagName => {
          return showTags.find(tag => tag.name === tagName) || { id: null, name: tagName };
        }).filter(tag => tag.id !== null);
        setSelectedTags(tagObjects);
      }
    }
  }, [isOpen, dollData?.id, showTags]); // 只在 modal 開啟時或 dollId 變化時重置

  // 標籤選擇切換
  const handleTagToggle = (tag) => {
    const isSelected = selectedTags.some(t => t.id === tag.id);
    
    if (isSelected) {
      setSelectedTags(selectedTags.filter(t => t.id !== tag.id));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const isTagSelected = (tag) => {
    return selectedTags.some(t => t.id === tag.id);
  };

  // 提交表單
  const handleSubmit = async () => {
    console.log('提交時的表單值:', {
      name: dollName,
      birthday: dollBirthday,
      description: dollDescription,
      imageFile: dollImage ? dollImage.name : null,
      tags: selectedTags.map(t => t.name)
    });
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    // 保存當前值到常數防止閉包問題
    const currentName = dollName;
    const currentBirthday = dollBirthday;
    const currentDescription = dollDescription;
    const currentImage = dollImage;
    const currentTags = [...selectedTags];
    
    const formData = new FormData();
    formData.append('name', currentName);
    formData.append('birthday', currentBirthday);
    formData.append('description', currentDescription);
    
    if (currentImage) {
      formData.append('avatar_image', currentImage);
    }
    
    if (currentTags.length > 0) {
      currentTags.forEach(tag => {
        formData.append('tag_ids', tag.id);
      });
    }
    
    try {
      const res = await edit_doll(dollData.id, formData);
      console.log('更新娃娃成功', res.data);
      setSuccess(true);
      
      // 如果是當前用戶的娃娃，更新全局數據
      if (dollData.id === auth_context.currentDollId) {
        auth_context.updateDollImg(res.data.avatar_image);
        auth_context.updateDollName(res.data.name);
      }
      
      // 回調通知父組件更新數據
      if (onDollUpdated) {
        onDollUpdated(res.data);
      }
      
      // 2秒後關閉模態框
      setTimeout(() => {
        toggle();
      }, 2000);
    } catch (err) {
      console.error('更新娃娃失敗:', err);
      setError(err.response?.data?.detail || '更新失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>編輯娃娃: {dollData?.id}</ModalHeader>
      <ModalBody>
        {error && (
          <Alert color="danger">{error}</Alert>
        )}
        
        {success && (
          <Alert color="success">娃娃資料更新成功！</Alert>
        )}
        
        <Form>
          <FormGroup row>
            <Label for="dollName" sm={3}>娃娃名稱</Label>
            <Col sm={9}>
              <Input
                id="dollName"
                type="text"
                placeholder="娃娃名稱"
                value={dollName}
                onChange={(e) => setDollName(e.target.value)}
              />
            </Col>
          </FormGroup>
          
          <FormGroup row>
            <Label for="dollBirthday" sm={3}>生日</Label>
            <Col sm={9}>
              <Input
                id="dollBirthday"
                type="date"
                value={dollBirthday}
                onChange={(e) => setDollBirthday(e.target.value)}
              />
            </Col>
          </FormGroup>
          
          <FormGroup row>
            <Label for="dollDescription" sm={3}>描述</Label>
            <Col sm={9}>
              <Input
                id="dollDescription"
                type="textarea"
                placeholder="描述娃娃的特點..."
                value={dollDescription}
                onChange={(e) => setDollDescription(e.target.value)}
              />
            </Col>
          </FormGroup>
          
          <FormGroup row>
            <Label for="dollImage" sm={3}>頭像圖片</Label>
            <Col sm={9}>
              <Input
                id="dollImage"
                type="file"
                accept="image/png, image/jpeg, image/gif"
                onChange={(e) => setDollImage(e.target.files[0])}
              />
              <small className="text-muted">留空表示不更改頭像</small>
            </Col>
          </FormGroup>
          
          <FormGroup row>
            <Label for="dollTags" sm={3}>標籤</Label>
            <Col sm={9}>
              <div className="d-flex flex-wrap">
                {showTags.map((tag) => (
                  <Button
                    key={tag.id}
                    color={isTagSelected(tag) ? 'primary' : 'secondary'}
                    onClick={() => handleTagToggle(tag)}
                    className="me-1 mb-1"
                    size="sm"
                    style={isTagSelected(tag) ? {
                      backgroundColor: '#ffd5fc',
                      border: 'none',
                      color: '#000'
                    } : {}}
                  >
                    {tag.name}
                  </Button>
                ))}
              </div>
            </Col>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button 
          color="secondary" 
          onClick={toggle}
          disabled={loading}
        >
          取消
        </Button>
        <Button 
          onClick={handleSubmit}
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