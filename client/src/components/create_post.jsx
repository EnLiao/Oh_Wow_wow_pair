import React, { useState } from 'react'
import { CreatePost } from '../services/api'

export default function create_post() {
    const dollId = localStorage.getItem('doll_id')
    const [postContent, setPostContent] = useState('')
    const [image_url, setImage_url] = useState('')

    const doll_info = JSON.parse(localStorage.getItem('doll_info'))
    console.log('doll_info', doll_info)

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
            const res = await CreatePost(formData) // axios 呼叫 createPost
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
