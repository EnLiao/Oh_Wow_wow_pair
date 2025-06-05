import React, { useState, useContext } from 'react';
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
  Col
} from 'reactstrap';

export default function CreateDoll() {
    const navigate = useNavigate();
    const auth_context = useContext(AuthContext);

    const [dollId, setDollId] = useState('');
    const [dollName, setDollName] = useState('');
    const [dollBirthday, setDollDate] = useState('');
    const [dollDescription, setDollDescription] = useState('');
    const [dollImage, setDollImage] = useState(null);
    
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
