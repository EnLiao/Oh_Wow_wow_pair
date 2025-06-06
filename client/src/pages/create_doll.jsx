import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { create_doll, get_tags } from '../services/api';
import { AuthContext } from '../services/auth_context';
import { 
  Container, 
  Card, 
  CardHeader, 
  CardBody, 
  Form, 
  FormGroup, 
  Label, 
  Input, 
  Button, 
  Col,
  ButtonGroup
} from 'reactstrap';

export default function CreateDoll() {
    const navigate = useNavigate();
    const auth_context = useContext(AuthContext);

    const [dollId, setDollId] = useState('');
    const [dollName, setDollName] = useState('');
    const [dollBirthday, setDollDate] = useState('');
    const [dollDescription, setDollDescription] = useState('');
    const [dollImage, setDollImage] = useState(null);
    const [showTags, setShowTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);

    const handleTagToggle = (tag) => {
        // 檢查標籤是否已被選中
        const isSelected = selectedTags.some(t => t.id === tag.id);
        
        if (isSelected) {
            // 如果已選中，則移除
            setSelectedTags(selectedTags.filter(t => t.id !== tag.id));
        } else {
            // 如果未選中，則添加
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const isTagSelected = (tag) => {
        return selectedTags.some(t => t.id === tag.id);
    };

    useEffect(() => {
        (async () => {
            try {
                const res = await get_tags();
                console.log('fetched tags:', res.data);
                setShowTags(res.data);
            } catch (err) {
                console.error('Error fetching tags:', err);
            }
        })();
    }, []);
    
    const handleSubmit = async () => {
        if (!dollName || !dollImage || !dollDescription || !dollBirthday || !dollId) {
            alert('Please fill in all fields');
            return;
        }
    
        const formData = new FormData();
        formData.append('id', dollId);
        formData.append('name', dollName);
        formData.append('birthday', dollBirthday);
        formData.append('description', dollDescription);
        formData.append('avatar_image', dollImage);
        if (selectedTags.length > 0) {
            // 將整個標籤陣列轉換為 JSON 字串
            formData.append('tags', JSON.stringify(selectedTags));
        }
        console.log(selectedTags);
    
        try {
            const res = await create_doll(formData);
            console.log('create doll success', res.data);
            alert('create doll success');
            auth_context.updateDollId(dollId);
            auth_context.updateDollImg(res.data.avatar_image);
            auth_context.updateDollName(dollName);
            console.log('doll_img', dollImage);
            console.log('doll_name', dollName);
            navigate('/main_page');
        } catch (err) {
            console.error(err);
            alert('create doll failed');
        }
    }
    
    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', paddingTop: '50px' }}>
            <Card style={{ width: '500px' }}>
                <CardHeader>
                    <h2 className="text-center mb-0">Create Doll</h2>
                </CardHeader>
                <CardBody>
                    <Form>
                        <FormGroup row>
                            <Label for="dollId" sm={3}>Doll ID</Label>
                            <Col sm={9}>
                                <Input
                                    id="dollId"
                                    type="text"
                                    placeholder="Doll ID"
                                    value={dollId}
                                    onChange={(e) => setDollId(e.target.value)}
                                    className="mb-0"
                                />
                            </Col>
                        </FormGroup>
                        
                        <FormGroup row>
                            <Label for="dollName" sm={3}>Doll Name</Label>
                            <Col sm={9}>
                                <Input
                                    id="dollName"
                                    type="text"
                                    placeholder="Doll Name"
                                    value={dollName}
                                    onChange={(e) => setDollName(e.target.value)}
                                    className="mb-0"
                                />
                            </Col>
                        </FormGroup>
                        
                        <FormGroup row>
                            <Label for="dollBirthday" sm={3}>Doll Birthday</Label>
                            <Col sm={9}>
                                <Input
                                    id="dollBirthday"
                                    type="date"
                                    placeholder="Birthday"
                                    value={dollBirthday}
                                    onChange={(e) => setDollDate(e.target.value)}
                                    className="mb-0"
                                />
                            </Col>
                        </FormGroup>
                        
                        <FormGroup>
                            <Label for="dollDescription">Description</Label>
                            <Input
                                id="dollDescription"
                                type="textarea"
                                placeholder="Doll Description"
                                value={dollDescription}
                                onChange={(e) => setDollDescription(e.target.value)}
                                className="mb-3"
                            />
                        </FormGroup>
                        
                        <FormGroup row>
                            <Label for="dollImage" sm={3}>Doll Image</Label>
                            <Col sm={9}>
                                <Input
                                    id="dollImage"
                                    type="file"
                                    accept="image/png, image/jpeg, image/gif"
                                    onChange={e => setDollImage(e.target.files[0])}
                                    className="mb-0"
                                />
                            </Col>
                        </FormGroup>

                        <FormGroup row>
                            <Label for="dollTags" sm={3}>Tags</Label>
                            <Col sm={9}>
                                <div className="d-flex flex-wrap mb-2">
                                    {showTags.map((tag) => (
                                        <Button
                                            key={tag.id || tag.name} // 確保有唯一的 key
                                            color={isTagSelected(tag) ? 'primary' : 'secondary'}
                                            onClick={() => handleTagToggle(tag)}
                                            className="me-1 mb-1" // 添加間距
                                            size="sm"
                                        >
                                            {tag.name || tag} {/* 顯示標籤名稱或值 */}
                                        </Button>
                                    ))}
                                </div>
                            </Col>
                        </FormGroup>
                        
                        <Button 
                            block 
                            onClick={handleSubmit}
                            style={{
                                color: '#000',
                                backgroundColor: '#ffd5fc',
                                border: 'none',
                            }}
                        >
                            Create Doll
                        </Button>
                    </Form>
                </CardBody>
            </Card>
        </Container>
    );
}
