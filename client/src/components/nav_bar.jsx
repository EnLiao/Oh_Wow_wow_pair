import log_out_icon from '../assets/log_out.png';
import search_icon from '../assets/search.png';
import { useNavigate } from 'react-router-dom';

export default function NavBar() {
    const navigate = useNavigate()

    const handleLogOut = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        console.log(localStorage.getItem('access_token'))
        console.log(localStorage.getItem('refresh_token'))
        navigate('/login')
    }
    return (
        <div 
          style={{
            height: '8%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            backgroundColor: '#F5F5F5', 
            borderBottom: '1px solid #E4E4E4', 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            zIndex: 100
            }}
          >
            <h3 
              style={{
                display: 'inline', 
                paddingLeft:'2%', 
                cursor: 'pointer',
                userSelect: 'none',
              }}
              onClick={() => {navigate('/main_page')}}
            >Oh-Wow-wow-pair</h3>
            <div style={{position: 'relative', width: '40%', height: '60%', display: 'flex', right:'5%'}}>
              <input
                type='text'
                placeholder="Oh-Wow-wow-pair"
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '5px',
                  backgroundColor: '#E4E4E4',
                  paddingLeft: 40,
                }}
              ></input>
              <img
                src={search_icon} 
                alt="search_icon" 
                style={{
                  width: 25,
                  height: 25,
                  position: 'absolute',
                  left: 10,
                  top: 4,
                }}
              ></img>
            </div>
            <img 
              src={log_out_icon} 
              alt="log out_icon" 
              onClick={handleLogOut}
              onMouseOver={(e) => {e.currentTarget.style.opacity = 0.5}}
              style={{
                width: 25,
                height: 25,
                float: 'right',
                marginRight: 130, 
                cursor: 'pointer'
              }}
            />
        </div>
    )
}