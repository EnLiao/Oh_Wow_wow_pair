export default function CreateDoll() {
    const [dollName, setDollName] = useState('')
    const [dollImage, setDollImage] = useState(null)
    const [dollDescription, setDollDescription] = useState('')
    const [dollType, setDollType] = useState('')
    
    const handleSubmit = async () => {
        if (!dollName || !dollImage || !dollDescription || !dollType) {
        alert('Please fill in all fields')
        return
        }
    
        const formData = new FormData()
        formData.append('name', dollName)
        formData.append('image', dollImage)
        formData.append('description', dollDescription)
        formData.append('type', dollType)
    
        try {
        const res = await createDoll(formData) // axios 呼叫 createDoll
        console.log('create doll success', res.data)
        alert('create doll success')
        } catch (err) {
        console.error(err)
        alert('create doll failed')
        }
    }
}
