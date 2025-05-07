import { useState, useContext} from 'react'
import { login, register, getDollInfo} from '../services/api'
import { useNavigate } from 'react-router-dom';
import { DollContext } from '../components/doll_context';
import { 
  Button, 
  Input, 
  Container, 
  Form, 
  FormGroup,
  Card,
  CardBody,
  CardHeader
} from 'reactstrap';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [nickname, setNickname] = useState('')
  const [avatar_url, setAvatar_url] = useState('')
  const [bio, setBio] = useState('')
  const navigate = useNavigate()

  const { setDollInfo } = useContext(DollContext);

  const handleSubmit = async () => {
    if (isSignUp) {
      const data = {
        username,
        password,
        email,
        nickname,
        avatar_url,
        bio
      };
  
      try {
        const res = await register(data); // axios 呼叫 register
        console.log('sign up success', res.data);
        alert('sign up success');
        navigate('/create_doll');
      } catch (err) {
        if (err.response) {
          const data = err.response.data;
          let message = '';
      
          if (typeof data === 'object' && data !== null) {
            if (data.detail) {
              // case 1: 有 detail
              message = data.detail;
            } else if (data.non_field_errors) {
              // case 2: 有 non_field_errors
              message = data.non_field_errors.join(', ');
            } else {
              // case 3: 欄位對應 array
              message = Object.entries(data)
                .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                .join('\n');
            }
          } else {
            message = 'Please check your input';
          }
      
          alert(`sign up failed:\n${message}`);
        } else if (err.request) {
          alert('sign up failed: No response from server');
        } else {
          alert(`sign up failed: ${err.message}`);
        }
      }
    } else {
      try {
        const res = await login({ username, password }); // axios 呼叫 login
        const { access, refresh } = res.data;
  
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        // get doll info by doll_id
        // const dollId = 'doll001';
        // localStorage.setItem('doll_id', dollId);
        // const dollRes = await getDollInfo(dollId);
        // localStorage.setItem('doll_info', JSON.stringify(dollRes.data));
        // setDollInfo(dollRes.data);

        alert('log in success');
        navigate('/main_page');
      } catch (err) {
        if (err.response) {
          const data = err.response.data;
          let message = '';
      
          if (typeof data === 'object' && data !== null) {
            if (data.detail) {
              // case 1: 有 detail
              message = data.detail;
            } else {
              // case 2: 欄位錯誤
              message = Object.entries(data)
                .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                .join('\n');
            }
          } else {
            message = 'Account or password is incorrect';
          }
      
          alert(`log in failed:\n${message}`);
        } else if (err.request) {
          alert('log in failed: No response from server');
        } else {
          alert(`log in failed: ${err.message}`);
        }
      }      
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center vh-100">
      <Card style={{ width: '400px' }}>
        <CardHeader>
          <h2 className="text-center mb-0">{isSignUp ? 'Sign Up' : 'Login'}</h2>
        </CardHeader>
        <CardBody>
          <Form>
            <FormGroup>
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mb-3"
              />
            </FormGroup>
    
            {isSignUp && (
              <>
                <FormGroup>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mb-3"
                  />
                </FormGroup>
                <FormGroup>
                  <Input
                    type="text"
                    placeholder="Nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="mb-3"
                  />
                </FormGroup>
                <FormGroup>
                  <Input
                    type="text"
                    placeholder="Avatar URL"
                    value={avatar_url}
                    onChange={(e) => setAvatar_url(e.target.value)}
                    className="mb-3"
                  />
                </FormGroup>
                <FormGroup>
                  <Input
                    type="text"
                    placeholder="Bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="mb-3"
                  />
                </FormGroup>
              </>
            )}
    
            <FormGroup>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mb-4"
              />
            </FormGroup>
  
            <Button 
              color="primary" 
              block 
              onClick={handleSubmit}
              className="mb-3"
            >
              {isSignUp ? 'Sign Up' : 'Login'}
            </Button>
    
            <Button
              color="secondary"
              block
              onClick={() => setIsSignUp(prev => !prev)}
            >
              {isSignUp ? 'Back to Login' : 'Sign Up'}
            </Button>
          </Form>
        </CardBody>
      </Card>
    </Container>
  )
}
