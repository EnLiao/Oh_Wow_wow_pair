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
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          paddingLeft:'5%',
        }}
      >
        <div>
          <h2>{doll.name}</h2>
          <img src={doll.photo} alt={doll.name} style={{width:200, height:200, objectFit:'cover', borderRadius: 30}}/>
          <h2>user: {doll.user_name}</h2>
          <h2>BirthDay: {doll.birthday}</h2>
          <h2>Bio: {doll.bio}</h2>
          <h2>Tag: {doll.tag}</h2>
        </div>
        <div style={{ width: '60%'}}>
          <h2 style={{textAlign:'center'}}>recently post</h2>
        </div>
      </div>
    )
}
  