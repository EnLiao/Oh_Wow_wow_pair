import { useState, useContext} from 'react'
import { login, register, doll_list_view} from '../services/api'
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../services/auth_context'
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
  const [avatarFile, setAvatarFile] = useState(null)
  const [bio, setBio] = useState('')
  const navigate = useNavigate()
  const auth_context = useContext(AuthContext)

  const handleSubmit = async () => {
    if (isSignUp) {
      const data = {
        username,
        password,
        email,
        nickname,
        avatarFile,
        bio
      };
  
      try {
        const res = await register(data); // axios 呼叫 register
        console.log('sign up success', res.data);
        alert('sign up success');
        setIsSignUp(false);
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
  
        auth_context.updateToken(access);
        auth_context.updateUsername(username);
        localStorage.setItem('refresh_token', refresh);

        try{
          const dollRes = await doll_list_view(username);
          const doll_list = dollRes.data;
          localStorage.setItem('doll_list', JSON.stringify(doll_list));
          console.log('doll_list', doll_list);
          auth_context.updateDollId(doll_list[0].id);
          console.log(username, auth_context.currentDollId, access);
          alert('log in success');
          navigate('/main_page');
        }
        catch(err){
          navigate('/create_doll');
        }
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
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={e => setAvatarFile(e.target.files[0])}
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
              block 
              onClick={handleSubmit}
              className="mb-3"
              style={{
                color: '#000',
                backgroundColor: '#ffd5fc',
                border: 'none',
              }}
            >
              {isSignUp ? 'Sign Up' : 'Login'}
            </Button>
    
            <Button
              block
              onClick={() => setIsSignUp(prev => !prev)}
              style={{
                color: '#000',
                backgroundColor: '#ffd5fc',
                border: 'none',
              }}
            >
              {isSignUp ? 'Back to Login' : 'Sign Up'}
            </Button>
          </Form>
        </CardBody>
      </Card>
    </Container>
  )
}
