import log_out_icon from '../assets/log_out.png';
import search_icon from '../assets/search.png';

export default function NavBar() {
    return (
        <div style={{height: '8%', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <h2 style={{display: 'inline', paddingLeft:'2%'}}>Oh-Wow-wow-pair</h2>
            <svg style={{cursor: 'pointer', position:'relative', right:'5%'}} width='35%' height='60%'>
                <rect width='100%' height='100%' fill="#E4E4E4" rx='5'/>
                <image
                  href={search_icon}
                  x='-30%'
                  y='10%'
                  width='75%'
                  height='75%'
                />
                <text x='35%' y='50%' fill="#AFAFAF" fontSize='15' fontFamily='Arial' dy='.35em'>Oh-Wow-wow-pair</text>
            </svg>
            <img 
              src={log_out_icon} 
              alt="log out_icon" 
              onClick={() => {console.log('log out')}}
              style={{
                width: 30,
                height: 30,
                float: 'right',
                marginRight: 20, 
                cursor: 'pointer'
              }}
            />
        </div>
    )
}