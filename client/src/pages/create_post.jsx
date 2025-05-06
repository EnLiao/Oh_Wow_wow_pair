import React, { useState, useContext} from 'react'
import { create_post } from '../services/api'
import { DollContext } from '../components/doll_context'

export default function CreatePost() {
    const dollId = localStorage.getItem('doll_id')
    const [postContent, setPostContent] = useState('')
    const [image_url, setImage_url] = useState('')

    const { dollInfo } = useContext(DollContext);
    console.log('dollInfo', dollInfo)

    const handleSubmit = async () => {
        if (!postContent || !image_url) {
            alert('Please fill in all fields')
            return
        }

        const formData = new FormData()
        formData.append('doll_id', dollId)
        formData.append('content', postContent)
        formData.append('image', postImage)

        try {
            const res = await create_post(formData) // axios 呼叫 createPost
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
            <input type="file" onChange={(e) => setPostImage(e.target.files[0])} />
            <br></br>
            <button onClick={handleSubmit}>Submit</button>
        </div>
    )
}
