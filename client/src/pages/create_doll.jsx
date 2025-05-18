import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { create_doll } from '../services/api';
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
  Button 
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
            auth_context.updateDollImg(dollImage);
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
            <Card style={{ width: '400px' }}>
                <CardHeader>
                    <h2 className="text-center mb-0">Create Doll</h2>
                </CardHeader>
                <CardBody>
                    <Form>
                        <FormGroup>
                            <Input
                                type="text"
                                placeholder="Doll ID"
                                value={dollId}
                                onChange={(e) => setDollId(e.target.value)}
                                className="mb-3"
                            />
                        </FormGroup>
                        
                        <FormGroup>
                            <Input
                                type="text"
                                placeholder="Doll Name"
                                value={dollName}
                                onChange={(e) => setDollName(e.target.value)}
                                className="mb-3"
                            />
                        </FormGroup>
                        
                        <FormGroup>
                            <Input
                                type="date"
                                placeholder="Birthday"
                                value={dollBirthday}
                                onChange={(e) => setDollDate(e.target.value)}
                                className="mb-3"
                            />
                        </FormGroup>
                        
                        <FormGroup>
                            <Input
                                type="textarea"
                                placeholder="Doll Description"
                                value={dollDescription}
                                onChange={(e) => setDollDescription(e.target.value)}
                                className="mb-3"
                            />
                        </FormGroup>
                        
                        <FormGroup>
                            <Input
                                type="file"
                                accept="image/png, image/jpeg, image/gif"
                                onChange={e => setDollImage(e.target.files[0])}
                                className="mb-3"
                            />
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
