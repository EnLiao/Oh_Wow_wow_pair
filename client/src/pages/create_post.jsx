import React, { useState, useContext} from 'react'
import { create_post } from '../services/api'
import { AuthContext } from '../components/auth_context'

export default function CreatePost() {
    const dollId = localStorage.getItem('doll_id')
    const [postContent, setPostContent] = useState('')
    const [image_url, setImage_url] = useState('')

    const { dollInfo } = useContext(AuthContext);
    console.log('dollInfo', dollInfo)

    const handleSubmit = async () => {
        if (!postContent || !image_url) {
            alert('Please fill in all fields')
            return
        }

        const data = {
            doll_id: dollId,
            content: postContent,
            image_url: image_url
        }

        try {
            const res = await create_post(data) // axios 呼叫 createPost
            console.log('create post success', res.data)
            alert('create post success')
        } catch (err) {
            console.error(err)
            alert('create post failed')
        }
    }

    return (
        <div style={
            { 
                paddingTop: 50,
                textAlign: 'center',
            }
        }>
            <h1>Create Post</h1>
            <input type="text" placeholder="Content" onChange={(e) => setPostContent(e.target.value)} />
            <br></br>
            <input type="url" placeholder='image_url' onChange={(e) => setImage_url(e.target.value)} />
            <br></br>
            <button onClick={handleSubmit}>Submit</button>
        </div>
    )
}
