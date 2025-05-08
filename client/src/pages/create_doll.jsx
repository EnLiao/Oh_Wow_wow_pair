import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { create_doll } from '../services/api'

export default function CreateDoll() {
    const navigate = useNavigate()

    const [dollId, setDollId] = useState('')
    const [dollName, setDollName] = useState('')
    const [dollBirthday, setDollDate] = useState('')
    const [dollDescription, setDollDescription] = useState('')
    const [dollImage, setDollImage] = useState('')
    
    const handleSubmit = async () => {
        if (!dollName || !dollImage || !dollDescription || !dollBirthday || !dollId) {
        alert('Please fill in all fields')
        return
        }
    
        const formData = new FormData()
        formData.append('id', dollId)
        formData.append('name', dollName)
        formData.append('birthday', dollBirthday)
        formData.append('description', dollDescription)
        formData.append('image', dollImage)
    
        try {
        const res = await create_doll(formData) // axios 呼叫 createDoll
        console.log('create doll success', res.data)
        alert('create doll success')
        localStorage.setItem('current_doll_id', dollId)
        navigate('/main_page')
        } catch (err) {
        console.error(err)
        alert('create doll failed')
        }
    }
    return (
        <div style={
            { 
                paddingTop: 50,
                textAlign: 'center',
            }
        }>
            <h1>Create Doll</h1>
            <input type="text" placeholder="Doll ID" onChange={(e) => setDollId(e.target.value)} />
            <br></br>
            <input type="text" placeholder="Doll Name" onChange={(e) => setDollName(e.target.value)} />
            <br></br>
            <input type='date' placeholder="Birthday" onChange={(e) => setDollDate(e.target.value)} />
            <br></br>
            <input type="text" placeholder="Doll Description" onChange={(e) => setDollDescription(e.target.value)} />
            <br></br>
            <input type="url" placeholder="Doll Avatar URL" onChange={(e) => setDollImage(e.target.value)} />
            <br></br>
            {/* choose tag of doll */}
            <br></br>
            <button onClick={handleSubmit}>Submit</button>
        </div>
    )
}
