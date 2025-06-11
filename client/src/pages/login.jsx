import { useState, useContext} from 'react'
import { login, register, doll_list_view, getDollInfo} from '../services/api'
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
  CardHeader,
  Col, 
  Label
} from 'reactstrap';
import ReCAPTCHA from 'react-google-recaptcha';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [nickname, setNickname] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [bio, setBio] = useState('')
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const navigate = useNavigate()
  const auth_context = useContext(AuthContext)

  const handleSubmit = async () => {
    if (!recaptchaToken) {
      alert('請先通過人機驗證');
      return;
    }
    if (isSignUp) {
      const data = {
        username,
        password,
        email,
        nickname,
        avatarFile,
        bio,
        recaptcha_token: recaptchaToken
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
        const res = await login({ username, password, recaptcha_token: recaptchaToken }); // axios 呼叫 login
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
          
          try{
            const res = await getDollInfo(doll_list[0].id);
            const doll_info = res.data;
            auth_context.updateDollImg(doll_info.avatar_image);
            auth_context.updateDollName(doll_info.name);
            alert('log in success');
            navigate('/main_page');
          }
          catch(err){
            console.error(err);
            alert('Failed to fetch doll info');
          }

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
      <Card style={{ width: '500px' }}>
        <CardHeader>
          <h2 className="text-center mb-0">{isSignUp ? 'Sign Up' : 'Login'}</h2>
        </CardHeader>
        <CardBody>
          <Form>
            <FormGroup row>
              <Label for="usernameInput" sm={3}>
                Username
              </Label>
              <Col sm={9}>
                <Input
                  id="usernameInput"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mb-0"
                />
              </Col>
            </FormGroup>
    
            {isSignUp && (
              <>
                <FormGroup row>
                  <Label for="emailInput" sm={3}>
                    Email
                  </Label>
                  <Col sm={9}>
                    <Input
                      id="emailInput"
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mb-0"
                    />
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Label for="nicknameInput" sm={3}>
                    Nickname
                  </Label>
                  <Col sm={9}>
                    <Input
                      type="text"
                      placeholder="Nickname"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="mb-0"
                    />
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Label for="avatarFileInput" sm={3}>
                    User Avatar
                  </Label>
                  <Col sm={9}>
                    <Input
                      id="avatarFileInput"
                      type="file"
                      accept="image/png, image/jpeg, image/gif"
                      onChange={e => setAvatarFile(e.target.files[0])}
                    />
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Label for="bioInput" sm={3}>Bio</Label>
                  <Col sm={9}>
                    <Input
                      id="bioInput"
                      type="text"
                      placeholder="Bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="mb-0"
                    />
                  </Col>
                </FormGroup>
              </>
            )}
    
            <FormGroup row>
              <Label for="passwordInput" sm={3}>
                Password
              </Label>
              <Col sm={9}>
                <Input
                  id="passwordInput"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mb-0"
                />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Col sm={{ size: 9, offset: 3 }}>
                <ReCAPTCHA
                  sitekey={RECAPTCHA_SITE_KEY}
                  onChange={token => setRecaptchaToken(token)}
                />
              </Col>
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
