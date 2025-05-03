import doll_img from '../assets/windy.jpg'

const doll = {
  name: 'Windy',
  photo: doll_img,
  user_name: 'cyucccx',
  birthday: '2024-11-16',
  bio: '我愛藤井風',
  tag: 'Fujii Kaze',
}

export default function DollPage() {
    return (
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          paddingLeft:'8%',
          paddingTop:50,
        }}
      >
        <div>
          <h2>{doll.name}</h2>
          <img 
            src={doll.photo} 
            alt={doll.name} 
            style={{
              width: '100%',
              maxWidth: '300px',
              aspectRatio: '1 / 1',
              overflow: 'hidden',
              borderRadius: 10,
              objectFit: 'cover',
              margin: '5% auto',
            }}
          />
          <p>user: {doll.user_id}</p>
          <p>BirthDay: {doll.birthday}</p>
          <p>Bio: {doll.bio}</p>
          <p>Tag: {doll.tag}</p>
        </div>
        <div style={{ width: '100%', paddingTop:'3%'}}>
          <p style={{textAlign:'center', fontSize:18}}>recently post</p>
        </div>
      </div>
    )
}
  